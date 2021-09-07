export default class RideCam {
    constructor() {
        this.matrix = mat4()
        this.eye = vec3(0, 2, 2)
        this.radius = 20
        this.theta = 0
        this.height = 10
        this.u = vec3(1, 0, 0)
        this.v = vec3(0, 1, 0)
        this.n = vec3(0, 0, 1)
        this.updateCamMatrix()

        this.controller = {
            ArrowUp: self => self.changeHeight(0.5),
            ArrowDown: self => self.changeHeight(-0.5),
            ArrowLeft: self => self.changeRadius(0.5),
            ArrowRight: self => self.changeRadius(-0.5),
            KeyR: self => self.reset()
        }
    }
    
    changeHeight(amt) {
        this.height = Math.max(this.height + amt, 0.5)
        this.eye = vec3(this.eye[0], this.height, this.eye[2])
        this.updateCamMatrix()
    }

    changeRadius(amt) {
        this.radius = Math.max(this.radius + amt, 0.5)
        this.updateCamMatrix()
    }

    updateCamMatrix() {
        this.matrix = lookAt(this.eye, vec3(0, 0, 0), vec3(0, 1, 0))
    }

    reset() {
        this.camera_matrix = mat4()
        this.eye = vec3(0, 10, 20)
        this.radius = 20
        this.theta = 0
        this.height = 10

        this.updateCamMatrix()
    }

    increment(amt) {
        this.theta = this.theta + amt
        var x = this.radius * Math.sin(this.theta)
        var y = this.height
        var z = this.radius * Math.cos(this.theta)

        this.eye = vec3(x, y, z)

        this.updateCamMatrix()
    }

    handleKey(key, shift) {
        let code = key
        if(shift) code += "_S"

        let fn = this.controller[code]
        if(fn) fn(this)
    }
}
