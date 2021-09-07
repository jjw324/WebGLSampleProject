export default class BaseModel {
    constructor(context, positions, shaderProgram) {
        this.gl = context
        this.vPositions = positions

        this.transformations = {
            s_x: 1,
            s_y: 1,
            s_z: 1,
            t_x: 0,
            t_y: 0,
            t_z: 0,
            r_x: 0,
            r_y: 0,
            r_z: 0
        }

        this.updateMM()

        this.program = shaderProgram
        this.gl.useProgram(this.program)

        this.vID = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vID)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(this.vPositions), this.gl.STATIC_DRAW)
        this.aPosition = this.gl.getAttribLocation(this.program, "aPosition")

        this.camID = this.gl.getUniformLocation(this.program, "cam")
        this.projID = this.gl.getUniformLocation(this.program, "proj")
        this.mmID = this.gl.getUniformLocation(this.program, "mm")
    }

    draw(mat_cam, mat_proj) {
        this.gl.useProgram(this.program)

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vID)
        this.gl.vertexAttribPointer(this.aPosition, 3, this.gl.FLOAT, false, 0, 0)

        this.gl.uniformMatrix4fv(this.camID, false, flatten(mat_cam))
        this.gl.uniformMatrix4fv(this.projID, false, flatten(mat_proj))
        this.gl.uniformMatrix4fv(this.mmID, false, flatten(this.MM))

        this.gl.enableVertexAttribArray(this.aPosition)
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vPositions.length)
        this.gl.disableVertexAttribArray(this.aPosition)
    }

    updateMM() {
        const t = this.transformations
        let r_matrix
        r_matrix = mult(rotateZ(t.r_z), mult(rotateX(t.r_x), rotateY(t.r_y)))
        this.MM = mult(translate(t.t_x, t.t_y, t.t_z), mult(r_matrix, scale(t.s_x, t.s_y, t.s_z)))
    }

    set trans(params) {
        for (const key in params) {
            if(Object.keys(this.transformations).includes(key)) this.transformations[key] = params[key]
        }
        this.updateMM()
    }

    get t_x() {
        return this.transformations.t_x
    }

    get t_y() {
        return this.transformations.t_y
    }

    get t_z() {
        return this.transformations.t_z
    }

    get r_x() {
        return this.transformations.r_x
    }

    get r_y() {
        return this.transformations.r_y
    }

    get r_z() {
        return this.transformations.r_z
    }

    get s_x() {
        return this.transformations.s_x
    }

    get s_y() {
        return this.transformations.s_y
    }

    get s_z() {
        return this.transformations.s_z
    }
}
