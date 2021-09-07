export default class FlyCam {
    constructor(e_x, e_y, e_z) {
        this.matrix = mat4()
        this.s_x = e_x
        this.s_y = e_y
        this.s_z = e_z
        this.eye = vec3(e_x, e_y, e_z)
        this.u = vec3(1, 0, 0)
        this.v = vec3(0, 1, 0)
        this.n = vec3(0, 0, 1)
        this.updateCamMatrix()

        this.controller = {
            ArrowUp: self => self.changeEye('-n'),
            ArrowDown: self => self.changeEye('+n'),
            ArrowLeft: self => self.changeEye('-u'),
            ArrowRight: self => self.changeEye('+u'),
            KeyZ: self => self.roll(10),
            KeyZ_S: self => self.roll(-10),
            KeyX: self => self.pitch(10),
            KeyX_S: self => self.pitch(-10),
            KeyC: self => self.yaw(10),
            KeyC_S: self => self.yaw(-10),
            KeyR: self => self.reset()
        }
    }    

    pitch(amt) {
        var angle = radians(amt)
        var vp = subtract(mult(Math.cos(angle), this.v), mult(Math.sin(angle), this.n))
        var np = add(mult(Math.sin(angle), this.v), mult(Math.cos(angle), this.n))
        this.v = normalize(vp)
        this.n = normalize(np)
        this.updateCamMatrix()
    }

    roll(amt) {
        var angle = radians(amt)
        var vp = subtract(mult(Math.cos(angle), this.v), mult(Math.sin(angle), this.u))
        var up = add(mult(Math.sin(angle), this.v), mult(Math.cos(angle), this.u))
        this.v = normalize(vp)
        this.u = normalize(up)
        this.updateCamMatrix()
    }

    yaw(amt) {
        var angle = radians(amt)
        var up = subtract(mult(Math.cos(angle), this.u), mult(Math.sin(angle), this.n))
        var np = add(mult(Math.sin(angle), this.u), mult(Math.cos(angle), this.n))
        this.u = normalize(up)
        this.n = normalize(np)
        this.updateCamMatrix()
    }

    updateCamMatrix() {
        this.matrix = lookAt(this.eye, subtract(this.eye, this.n), this.v)
    }

    changeEye(axis) {
        if (axis === '+u') {
            this.eye = add(this.eye, this.u)
        } else if (axis === '-u') {
            this.eye = subtract(this.eye, this.u)
        } else if (axis === '-n') {
            this.eye = subtract(this.eye, this.n)
        } else if (axis === '+n') {
            this.eye = add(this.eye, this.n)
        }
        this.updateCamMatrix()
    }

    reset() {
        this.camera_matrix = mat4()
        this.eye = vec3(this.s_x, this.s_y, this.s_z)
        this.u = vec3(1, 0, 0)
        this.v = vec3(0, 1, 0)
        this.n = vec3(0, 0, 1)
        this.updateCamMatrix()
    }

    handleKey(key, shift) {
        let code = key
        if(shift) code += "_S"
        let fn = this.controller[code]
        if(fn) fn(this)
    }
}
