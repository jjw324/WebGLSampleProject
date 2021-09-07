import BaseModel from "./BaseModel.js"

export default class SkyBox extends BaseModel {
    static getPos = [
            vec3(-0.5, -0.5, 0.5),
            vec3(0.5, -0.5, 0.5),
            vec3(0.5, 0.5, 0.5),
            vec3(-0.5, -0.5, 0.5),
            vec3(0.5, 0.5, 0.5),
            vec3(-0.5, 0.5, 0.5),
            vec3(0.5, 0.5, 0.5),
            vec3(0.5, -0.5, 0.5),
            vec3(0.5, -0.5, -0.5),
            vec3(0.5, 0.5, 0.5),
            vec3(0.5, -0.5, -0.5),
            vec3(0.5, 0.5, -0.5),
            vec3(-0.5, -0.5, 0.5),
            vec3(-0.5, -0.5, -0.5),
            vec3(0.5, -0.5, -0.5),
            vec3(-0.5, -0.5, 0.5),
            vec3(0.5, -0.5, -0.5),
            vec3(0.5, -0.5, 0.5),
            vec3(-0.5, 0.5, 0.5),
            vec3(0.5, 0.5, 0.5),
            vec3(0.5, 0.5, -0.5),
            vec3(-0.5, 0.5, 0.5),
            vec3(0.5, 0.5, -0.5),
            vec3(-0.5, 0.5, -0.5),
            vec3(-0.5, -0.5, -0.5),
            vec3(-0.5, 0.5, -0.5),
            vec3(0.5, 0.5, -0.5),
            vec3(-0.5, -0.5, -0.5),
            vec3(0.5, 0.5, -0.5),
            vec3(0.5, -0.5, -0.5),
            vec3(-0.5, -0.5, 0.5),
            vec3(-0.5, 0.5, 0.5),
            vec3(-0.5, 0.5, -0.5),
            vec3(-0.5, -0.5, 0.5),
            vec3(-0.5, 0.5, -0.5),
            vec3(-0.5, -0.5, -0.5)
    ]

    constructor(context, textures, shaderProgram) {
        super(context, SkyBox.getPos, shaderProgram)

        this.MM = mat4()

        this.textureID = this.gl.createTexture()
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.textureID)
        this.gl.texParameterf(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR)
        this.gl.texParameterf(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR)
        this.gl.texParameterf(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
        this.gl.texParameterf(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)
        this.gl.texParameterf(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_R, this.gl.CLAMP_TO_EDGE)

        let images = []
        
        for (let i = 0; i < textures.length; i++) {
            let face
            if (textures[i].includes("top"))
                face = this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y
            else if (textures[i].includes("bottom"))
                face = this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y
            else if (textures[i].includes("front"))
                face = this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z
            else if (textures[i].includes("back"))
                face = this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
            else if (textures[i].includes("left"))
                face = this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X
            else if (textures[i].includes("right"))
                face = this.gl.TEXTURE_CUBE_MAP_POSITIVE_X

            
            let self = this
            images.push(new Image())
            images[i].onload = function() {
                self.gl.bindTexture(self.gl.TEXTURE_CUBE_MAP, self.textureID)
                self.gl.texImage2D(face, 0, self.gl.RGB, this.width, this.height, 0, self.gl.RGB, self.gl.UNSIGNED_BYTE, images[i])
            }
            images[i].src = textures[i]
        }

        this.textureUnit = this.gl.getUniformLocation(this.program, "textureUnit")
    }

    draw(n, v, mat_proj) {
        this.gl.useProgram(this.program)

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vID)
        this.gl.vertexAttribPointer(this.aPosition, 3, this.gl.FLOAT, false, 0, 0)
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.textureID)
        this.gl.activeTexture(this.gl.TEXTURE0)
        
        this.gl.uniformMatrix4fv(this.camID, false, flatten(lookAt(vec3(0,0,0), subtract(vec3(0,0,0),n), v)))
        this.gl.uniformMatrix4fv(this.projID, false, flatten(mat_proj))
        this.gl.uniformMatrix4fv(this.mmID, false, flatten(this.MM))
        this.gl.uniform1i(this.textureUnit, 0)

        this.gl.enableVertexAttribArray(this.aPosition)
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vPositions.length)
        this.gl.disableVertexAttribArray(this.aPosition)
    }
}
