import BaseModel from "./BaseModel.js"

export default class TLModel extends BaseModel {
    constructor(context, positions, shaderProgram, texture, light) {
        super(context, positions, shaderProgram)

        this.vNormals = []
        this.vTexs = []

        this.generateNormals()
        this.assignGouraudNormals()
        this.assignTexCoords()

        this.light = light

        let tex = new Image()
        let self = this
        tex.onload = function () {
            self.textureID = self.gl.createTexture()
            self.gl.bindTexture(self.gl.TEXTURE_2D, self.textureID)
            self.gl.texImage2D(self.gl.TEXTURE_2D, 0, self.gl.RGB, this.width, this.height, 0, self.gl.RGB, self.gl.UNSIGNED_BYTE, tex)
            self.gl.generateMipmap(self.gl.TEXTURE_2D)
            self.gl.texParameteri(self.gl.TEXTURE_2D, self.gl.TEXTURE_MIN_FILTER, self.gl.NEAREST)
            self.gl.texParameteri(self.gl.TEXTURE_2D, self.gl.TEXTURE_MAG_FILTER, self.gl.NEAREST)
        }
        tex.src = texture
        this.textureID = this.gl.createTexture()

        this.nID = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nID)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(this.vNormals), this.gl.STATIC_DRAW)
        this.aNormal = this.gl.getAttribLocation(this.program, "aNormal")

        this.tCoordID = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.tCoordID)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(this.vTexs), this.gl.STATIC_DRAW)
        this.aTCoord = this.gl.getAttribLocation(this.program, "aTCoord")

        this.lightPos = this.gl.getUniformLocation(this.program, "lightPos")
        this.lightDiff = this.gl.getUniformLocation(this.program, "lightDiffuse")
        this.lightSpec = this.gl.getUniformLocation(this.program, "lightSpecular")
        this.lightAmb = this.gl.getUniformLocation(this.program, "lightAmbient")
        this.matSpec = this.gl.getUniformLocation(this.program, "matSpecular")
        this.matDiff = this.gl.getUniformLocation(this.program, "matDiffuse")
        this.matAmb = this.gl.getUniformLocation(this.program, "matAmbient")
        this.matAlpha = this.gl.getUniformLocation(this.program, "matAlpha")
        this.textureUnit = this.gl.getUniformLocation(this.program, "textureUnit")
    }

    draw(cam, mat_proj, light) {
        this.gl.useProgram(this.program)

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vID)
        this.gl.vertexAttribPointer(this.aPosition, 3, this.gl.FLOAT, false, 0, 0)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nID)
        this.gl.vertexAttribPointer(this.aNormal, 3, this.gl.FLOAT, false, 0, 0)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.tCoordID)
        this.gl.vertexAttribPointer(this.aTCoord, 2, this.gl.FLOAT, false, 0, 0)

        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureID)
        this.gl.activeTexture(this.gl.TEXTURE0)
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT)

        this.gl.uniformMatrix4fv(this.camID, false, flatten(cam.matrix))
        this.gl.uniformMatrix4fv(this.projID, false, flatten(mat_proj))
        this.gl.uniformMatrix4fv(this.mmID, false, flatten(this.MM))

        this.gl.uniform4fv(this.lightPos, light.position)
        this.gl.uniform4fv(this.lightDiff, light.diffuse)
        this.gl.uniform4fv(this.lightSpec, light.specular)
        this.gl.uniform4fv(this.lightAmb, light.ambient)
        this.gl.uniform4fv(this.matSpec, this.light.specular)
        this.gl.uniform4fv(this.matDiff, this.light.diffuse)
        this.gl.uniform4fv(this.matAmb, this.light.ambient)
        this.gl.uniform1f(this.matAlpha, this.light.shine)

        this.gl.uniform1i(this.textureUnit, 0)

        this.gl.enableVertexAttribArray(this.aPosition)
        this.gl.enableVertexAttribArray(this.aNormal)
        this.gl.enableVertexAttribArray(this.aTCoord)

        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vPositions.length)

        this.gl.disableVertexAttribArray(this.aPosition)
        this.gl.disableVertexAttribArray(this.aNormal)
        this.gl.disableVertexAttribArray(this.aTCoord)
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

    assignTexCoords() {
        for (let i = 0; i < this.vPositions.length; i = i + 6) {
            //first triangle
            this.vTexs.push(vec2(0.0, 0.0))
            this.vTexs.push(vec2(1.0, 0.0))
            this.vTexs.push(vec2(1.0, 1.0))
            //second triangle
            this.vTexs.push(vec2(0.0, 0.0))
            this.vTexs.push(vec2(1.0, 1.0))
            this.vTexs.push(vec2(0.0, 1.0))
        }
    }

}
