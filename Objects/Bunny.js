import TLModel from './TLModel.js'

export default class Bunny extends TLModel {
    static maxStep = 250
    constructor(context, positions, shaderProgram, texture, light) {
        super(context, positions, shaderProgram, texture, light)

        this._jump = {
            dx: 0,
            dy: 0,
            dz: 0
        }

        this.isJumping = false
        this.step = 0
    }

    animate() {
        if (++this.step > Bunny.maxStep) {
            this.step = 0
            this.isJumping = false
        } else {
            let newY = 1.5 + (this.dy * Math.sin((this.step / Bunny.maxStep) * Math.PI))
            let newX = this.t_x + (1 / Bunny.maxStep) * this.dx
            let newZ = this.t_z + (1 / Bunny.maxStep) * this.dz

            if (newX > 48) newX = 48
            else if (newX < -48) newX = -48
            else if (newX < 15 && newX > -15 && newZ < 15 && newZ > -15) newX = this.t_x

            if (newZ > 48) newZ = 48
            else if (newZ < -48) newZ = -48
            else if (newZ < 15 && newZ > -15 && newX < 15 && newX > -15) newZ = this.t_z

            this.trans = { t_x: newX, t_y: newY, t_z: newZ }
        }
    }

    set jump(params) {
        this.trans = { r_y: params.direction }
        this._jump.dx = params.distance * Math.sin((this.r_y - 75) * (Math.PI / 180))
        this._jump.dy = params.height
        this._jump.dz = params.distance * Math.cos((this.r_y - 75) * (Math.PI / 180))
        this.isJumping = true
        this.step = 0
    }

    get dx() {
        return this._jump.dx
    }
    get dy() {
        return this._jump.dy
    }
    get dz() {
        return this._jump.dz
    }
}