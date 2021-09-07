import { texNightSky, texDaySky, texGrass, texBunny, texRoof, texSlate, texWood, texBrick } from './Textures/index.js'
import { FlyCam, RideCam, Light, SkyBox, TLModel, Bunny, MirrorObject } from './Objects/index.js'
import { getRandomInRange, getPlane, getFromFile } from './Library/index.js'
import { shSky, shTL, shRef } from './Shaders/index.js'
import { modBunny, modCow } from './Models/index.js'
import { getSphere } from './Library/Geometry.js'

const points = getFromFile(modBunny)
const proj = perspective(90, 1, 0.1, 100)
let gl, light, sky
let shaderTL, shaderSky
let daysky, nightsky
let sphere
let bunnies = [], sceneItems = []
let mX = 0, mY = 0
let objLight = new Light(null, vec4(1, 1, 1, 1), vec4(1, 1, 1, 1), vec4(1, 1, 1, 1), 10)
let flycam = new FlyCam(0, 5, 40)
let ridecam = new RideCam()
let cam = flycam
const canvas = document.getElementById("gl-canvas")
gl = canvas.getContext('webgl2')

window.onload = () => {
    if (!gl)
        alert("WebGL 2.0 isn't available")

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0.9, 0.9, 0.9, 1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.cullFace(gl.BACK)

    shaderTL = initShaders(gl, shTL.v, shTL.f)
    shaderSky = initShaders(gl, shSky.v, shSky.f)
    let shaderRef = initShaders(gl, shRef.v, shRef.f)

    daysky = new SkyBox(gl, texDaySky, shaderSky)
    nightsky = new SkyBox(gl, texNightSky, shaderSky)
    nightsky.trans = { r_x: -90 }
    sky = daysky
    light = new Light(
        vec4(4, 100, 0, 0),
        vec4(1, 1, 1, 1),
        vec4(1, 1, 1, 1),
        vec4(1, 1, 1, 1),
        null
    )
    light.step = 0
    light.maxStep = 10000

    let ground = new TLModel(gl, getPlane(3), shaderTL, texGrass, objLight)
    ground.trans = { s_x: 50, s_z: 50 }
    sceneItems.push(ground)

    let path = new TLModel(gl, getPlane(4), shaderTL, texSlate, objLight)
    path.trans = { s_x: 5, s_z: 15, t_y: 0.01, t_z: 35 }
    sceneItems.push(path)

    let lot = new TLModel(gl, getPlane(4), shaderTL, texSlate, objLight)
    lot.trans = { s_x: 20, s_z: 20, t_y: 0.01 }
    sceneItems.push(lot)

    let wall_a = new TLModel(gl, getPlane(0), shaderTL, texWood, objLight)
    wall_a.trans = { s_x: 3.5, s_z: 10, r_x: 90, r_y: 90, t_y: 3.5, t_z: 10 }
    sceneItems.push(wall_a)

    let roof_a = new TLModel(gl, getPlane(0), shaderTL, texRoof, objLight)
    roof_a.trans = { s_x: 7, s_z: 11, r_x: 37, r_y: 90, t_y: 10.5, t_z: 5.5 }
    sceneItems.push(roof_a)

    let wall_b = new TLModel(gl, getPlane(0), shaderTL, texWood, objLight)
    wall_b.trans = { s_x: 3.5, s_z: 10, r_z: 90, t_y: 3.5, t_x: -10 }
    sceneItems.push(wall_b)

    let wall_b2 = new TLModel(
        gl,
        [
            vec3(-10, 14.3, 0),
            vec3(-10, 7, 0),
            vec3(-10, 7, 10),
            vec3(-10, 7, -10),
            vec3(-10, 7, 0),
            vec3(-10, 14.3, 0),
        ],
        shaderTL,
        texWood,
        objLight
    )
    sceneItems.push(wall_b2)

    let wall_c = new TLModel(gl, getPlane(0), shaderTL, texWood, objLight)
    wall_c.trans = { s_x: 3.5, s_z: 10, r_x: 90, r_y: 90, t_y: 3.5, t_z: -10 }
    sceneItems.push(wall_c)

    let roof_c = new TLModel(gl, getPlane(0), shaderTL, texRoof, objLight)
    roof_c.trans = { s_x: 7, s_z: 11, r_x: -37, r_y: 90, t_y: 10.5, t_z: -5.5 }
    sceneItems.push(roof_c)

    let wall_d = new TLModel(gl, getPlane(0), shaderTL, texWood, objLight)
    wall_d.trans = { s_x: 3.5, s_z: 10, r_z: 90, t_y: 3.5, t_x: 10 }
    sceneItems.push(wall_d)

    let wall_d2 = new TLModel(
        gl,
        [
            vec3(10, 14.3, 0),
            vec3(10, 7, 0),
            vec3(10, 7, 10),
            vec3(10, 7, -10),
            vec3(10, 7, 0),
            vec3(10, 14.3, 0),
        ],
        shaderTL,
        texWood,
        objLight
    )
    sceneItems.push(wall_d2)

    for (let i = 0; i < 10; i++) {
        bunnies.push(generateBunny(points))
    }

    sphere = new MirrorObject(gl, getFromFile(modCow), shaderRef)
    sphere.trans = { s_x: 10, s_y: 10, s_z: 10, t_y: 3 }

    animate()
}

function animate() {
    setInterval(function () {
        if (cam === ridecam) cam.increment(0.005)
        animateSun(light)

        for (let i = 0; i < bunnies.length; i++) {
            if (bunnies[i].isJumping) bunnies[i].animate()
            else if (Math.floor(getRandomInRange(0, 1000, false)) === 58) {
                bunnies[i].jump = {
                    direction: getRandomInRange(0, 360, false),
                    distance: getRandomInRange(2, 7, false),
                    height: getRandomInRange(1.5, 7, false)
                }
            }
        }

        render()
    }, 10)
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.disable(gl.DEPTH_TEST)
    sky.draw(cam.n, cam.v, proj)
    gl.enable(gl.DEPTH_TEST)

    for (let i = 0; i < sceneItems.length; i++) {
        sceneItems[i].draw(cam, proj, light)
    }

    for (let i = 0; i < bunnies.length; i++) {
        bunnies[i].draw(cam, proj, light)
    }
    sphere.draw(cam, proj, sceneItems.concat(...bunnies), light)
}

window.addEventListener('keydown', event => {
    switch (event.code) {
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'ArrowUp':
        case 'ArrowDown':
        case 'KeyZ':
        case 'KeyX':
        case 'KeyC':
        case 'KeyR':
            cam.handleKey(event.code, event.shiftKey)
            break
        case 'KeyB':
            bunnies.push(generateBunny(points))
            break
        case 'KeyK':
            bunnies.splice(getRandomInRange(0, bunnies.length, false), 1)
            break
        case 'KeyT':
            cam = (cam === flycam) ? ridecam : flycam
            break
    }
    render()
})

gl.canvas.addEventListener('mousemove', event => {
    const r = canvas.getBoundingClientRect()

    mX = event.clientX - r.left
    mY = event.clientY - r.top
})

gl.canvas.addEventListener('click', () => {
    if (sky === daysky) return

    const pX = mX * gl.canvas.width / gl.canvas.clientWidth
    const pY = gl.canvas.height - mY * gl.canvas.height / gl.canvas.clientHeight - 1
    const data = new Uint8Array(4)

    gl.readPixels(pX, pY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data)
    let test1 = vec4(data[0]/255, data[1]/255, data[2]/255, data[3]/255)

    for (let i = 0; i < bunnies.length; i++) {
        let test2 = (mult(bunnies[i].light.ambient, light.ambient))
        let distance = Math.sqrt(
            (test1[0] - test2[0]) ** 2 
            + (test1[1] - test2[1]) ** 2 
            + (test1[2] - test2[2]) ** 2 
            + (test1[3] - test2[3]) ** 2 
        )
        if (distance < 0.01)
            bunnies.splice(i,1)
    }
})

function animateSun(light) {
    light.step = (light.step + 1) % light.maxStep
    let newPos = vec4(
        100 * Math.sin(2 * 3.14 * (light.step / light.maxStep)),
        100 * Math.cos(2 * 3.14 * (light.step / light.maxStep)),
        0,
        1
    )

    if (light.position[1] > 0 && newPos[1] < 0) {
        light.diffuse = light.specular = vec4(0, 0, 0, 0)
        light.ambient = vec4(.5, .5, .5, 1)
        sky = nightsky
    } else if (light.position[1] < 0 && newPos[1] > 0) {
        light.diffuse = light.specular = vec4(1, 1, 1, 1)
        light.ambient = vec4(1, 1, 1, 1)
        sky = daysky
    }
    light.position = newPos
}

function generateBunny(points) {
    let color = vec4(Math.random(), Math.random(), Math.random(), 1)
    let bunnyLight = new Light(null, color, color, color, 10)
    let bunny = new Bunny(gl, points, shaderTL, texBunny, bunnyLight)
    bunny.trans = {
        s_x: 3,
        s_y: 3,
        s_z: 3,
        t_x: getRandomInRange(20, 45, true),
        t_z: getRandomInRange(20, 45, true),
        r_y: getRandomInRange(20, 45, true),
        t_y: 1.5
    }
    return bunny
}
