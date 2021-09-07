import BaseModel from "./BaseModel.js";

export default class MirrorObject extends BaseModel {
    constructor(context, positions, shaderProgram) {
        super(context, positions, shaderProgram)

        this.vNormals = []
        this.generateNormals()
        this.assignGouraudNormals()

        this.nID = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nID)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(this.vNormals), this.gl.STATIC_DRAW)
        this.aNormal = this.gl.getAttribLocation(this.program, "aNormal")

        this.envTextureID = this.gl.createTexture()
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.envTextureID)

        this.gl.texParameterf(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR)
        this.gl.texParameterf(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR)
        this.gl.texParameterf(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
        this.gl.texParameterf(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)
        this.gl.texParameterf(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_R, this.gl.CLAMP_TO_EDGE)

        this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, this.gl.RGB, 256, 256, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, null)
        this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, this.gl.RGB, 256, 256, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, null)
        this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, this.gl.RGB, 256, 256, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, null)
        this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, this.gl.RGB, 256, 256, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, null)
        this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, this.gl.RGB, 256, 256, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, null)
        this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, this.gl.RGB, 256, 256, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, null)

        this.envFrameBuffer = this.gl.createFramebuffer()
        this.envFrameBuffer.width = 256
        this.envFrameBuffer.height = 256
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.envFrameBuffer)
        this.envRenderBuffer = this.gl.createRenderbuffer()
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.envRenderBuffer)
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, 256, 256)
        this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.envRenderBuffer)
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, this.envTextureID, 0)
        var status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER)
        
        if (status != this.gl.FRAMEBUFFER_COMPLETE)
            alert("Frame Buffer Not Complete")
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null) //restore to window frame/depth buffer
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null)

        this.textureUnit = this.gl.getUniformLocation(this.program, "textureUnit")
    }

    draw(cam, mat_proj, objects, light) {
        this.createEnvironmentMap(cam, objects, light)

        this.gl.useProgram(this.program)

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vID)
        this.gl.vertexAttribPointer(this.aPosition, 3, this.gl.FLOAT, false, 0, 0)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nID)
        this.gl.vertexAttribPointer(this.aNormal, 3, this.gl.FLOAT, false, 0, 0)
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.envTextureID)
        this.gl.activeTexture(this.gl.TEXTURE0)
        
        this.gl.uniformMatrix4fv(this.camID, false, flatten(cam.matrix))
        this.gl.uniformMatrix4fv(this.projID, false, flatten(mat_proj))
        this.gl.uniformMatrix4fv(this.mmID, false, flatten(this.MM))
        this.gl.uniform1i(this.textureUnit, 0)

        this.gl.enableVertexAttribArray(this.aPosition)
        this.gl.enableVertexAttribArray(this.aNormal)
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vPositions.length)
        this.gl.disableVertexAttribArray(this.aPosition)
        this.gl.disableVertexAttribArray(this.aNormal)
    }

    createEnvironmentMap(cam, objects, light) {
        var origu = vec3(cam.u)
        var origv = vec3(cam.v)
        var orign = vec3(cam.n)
        var origeye = vec3(cam.eye)
        var viewportParams = this.gl.getParameter(this.gl.VIEWPORT)

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.envFrameBuffer)
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.envRenderBuffer)
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.envTextureID)

        this.gl.viewport(0, 0, 256, 256)
        let proj_matrix = perspective(90, 1.0, 0.1, 100)
        cam.eye = vec3(this.t_x, this.t_y, this.t_z)

        for (var j = 0; j < 6; j++) {
            this.gl.activeTexture(this.gl.TEXTURE0)
            this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.envTextureID)
            switch (j) {
                case 0: //-z
                    cam.u = vec3(-1, 0, 0)
                    cam.v = vec3(0, -1, 0)
                    cam.n = vec3(0, 0, 1)
                    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, this.envTextureID, 0)
                    break
                case 1: //+z
                    cam.u = vec3(1, 0, 0)
                    cam.v = vec3(0, 1, 0)
                    cam.n = vec3(0, 0, -1)
                    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z, this.envTextureID, 0)
                    break
                case 2: //+x
                    cam.u = vec3(0, 0, 1)
                    cam.v = vec3(0, 1, 0)
                    cam.n = vec3(-1, 0, 0)
                    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_CUBE_MAP_POSITIVE_X, this.envTextureID, 0)
                    break
                case 3: //-x
                    cam.u = vec3(0, 0, -1)
                    cam.v = vec3(0, 1, 0)
                    cam.n = vec3(1, 0, 0)
                    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X, this.envTextureID, 0)
                    break
                case 4: //-y
                    cam.u = vec3(1, 0, 0)
                    cam.v = vec3(0, 0, 1)
                    cam.n = vec3(0, 1, 0)
                    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, this.envTextureID, 0)
                    break
                case 5: //+y
                    cam.u = vec3(1, 0, 0)
                    cam.v = vec3(0, 0, 1)
                    cam.n = vec3(0, -1, 0)
                    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y, this.envTextureID, 0)
                    break
            }
            cam.updateCamMatrix()
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
            for (var i = 0; i < objects.length; i++)
                if (objects[i] != this)
                    objects[i].draw(cam, proj_matrix, light)
        }
        //the regular rendering
        cam.u = origu
        cam.v = origv
        cam.n = orign
        cam.eye = origeye
        cam.updateCamMatrix()
        proj_matrix = perspective(90, 1.0, 0.1, 10)
        this.gl.viewport(viewportParams[0], viewportParams[1], viewportParams[2], viewportParams[3])
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null)
    }

    generateNormals() {
        for (let i = 0; i < this.vPositions.length; i = i + 3) {
            let n = normalize(cross(subtract(this.vPositions[i+1], this.vPositions[i]), subtract(this.vPositions[i+2], this.vPositions[i])))
            this.vNormals.push(n,n,n)
        }
    }

    assignGouraudNormals() {
        let normalSum = []
        let counts = []
        for (let i = 0; i < this.vPositions.length; i++) {
            normalSum.push(vec3(0, 0, 0))
            counts.push(0)
        }

        //for each vertex, find all duplicates and assign the normal to be the average.
        for (let i = 0; i < this.vPositions.length; i++) {
            let count = 0
            for (let j = 0; j < this.vPositions.length; j++) {
                if ((this.vPositions[i][0] == this.vPositions[j][0]) &&
                    (this.vPositions[i][1] == this.vPositions[j][1]) &&
                    (this.vPositions[i][2] == this.vPositions[j][2])) {
                    count++
                    normalSum[i] = add(normalSum[i], this.vNormals[j])
                }
            }
            counts[i] = count
        }
        for (let i = 0; i < this.numVertices; i++)
            this.vNormals[i] = mult(1.0 / counts[i], normalSum[i])
    }
}
