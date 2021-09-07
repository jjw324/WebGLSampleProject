function divideTriangleSphere(a, b, c, divisions) {
    let out = []
    if (divisions > 0) {
        let v1 = normalize(add(a, b))
        let v2 = normalize(add(a, c))
        let v3 = normalize(add(b, c))

        out = out.concat(divideTriangleSphere(a, v1, v2, divisions - 1))
        out = out.concat(divideTriangleSphere(c, v2, v3, divisions - 1))
        out = out.concat(divideTriangleSphere(b, v3, v1, divisions - 1))
        out = out.concat(divideTriangleSphere(v1, v3, v2, divisions - 1))
    }
    else {
        out = [a, b, c]
    }

    return out
}
function divideTrianglePlane(a, b, c, divisions) {
    let out = []
    if (divisions > 0) {
        let v1 = vec3((a[0] + b[0]) / 2.0, (a[1] + b[1]) / 2.0, (a[2] + b[2]) / 2.0)
        let v2 = vec3((a[0] + c[0]) / 2.0, (a[1] + c[1]) / 2.0, (a[2] + c[2]) / 2.0)
        let v3 = vec3((b[0] + c[0]) / 2.0, (b[1] + c[1]) / 2.0, (b[2] + c[2]) / 2.0)

        out = out.concat(divideTrianglePlane(a, v1, v2, divisions - 1))
        out = out.concat(divideTrianglePlane(c, v2, v3, divisions - 1))
        out = out.concat(divideTrianglePlane(b, v3, v1, divisions - 1))
        out = out.concat(divideTrianglePlane(v1, v3, v2, divisions - 1))
    }
    else {
        out = [a, b, c]
    }

    return out
}

function subdividePlane(points, divisions) {
    let out = []
    for (let i = 0; i < points.length; i = i + 3) {
        out = out.concat(divideTrianglePlane(points[i], points[i + 1], points[i + 2], divisions))
    }
    return out
}
function subdivideSphere(points, divisions) {
    let out = []
    for (let i = 0; i < points.length; i = i + 3) {
        out = out.concat(divideTriangleSphere(points[i], points[i + 1], points[i + 2], divisions))
    }
    return out
}

function getPlane(divisions) {
    return subdividePlane([
        vec3(-1, 0, -1),
        vec3(-1, 0, 1),
        vec3(1, 0, 1),
        vec3(-1, 0, -1),
        vec3(1, 0, 1),
        vec3(1, 0, -1)
    ], divisions)
}

function getSphere(divisions) {
    return subdivideSphere([
        vec3(0, 0, 1),
        vec3(0, 2 * Math.sqrt(2) / 3, -1.0 / 3),
        vec3(-1 * Math.sqrt(6) / 3.0, -1 * Math.sqrt(2) / 3.0, -1.0 / 3),
        vec3(Math.sqrt(6) / 3.0, -1 * Math.sqrt(2) / 3.0, -1.0 / 3),
        vec3(-1 * Math.sqrt(6) / 3.0, -1 * Math.sqrt(2) / 3.0, -1.0 / 3),
        vec3(0, 2 * Math.sqrt(2) / 3, -1.0 / 3),
        vec3(0, 0, 1),
        vec3(Math.sqrt(6) / 3.0, -1 * Math.sqrt(2) / 3.0, -1.0 / 3),
        vec3(0, 2 * Math.sqrt(2) / 3, -1.0 / 3),
        vec3(0, 0, 1),
        vec3(-1 * Math.sqrt(6) / 3.0, -1 * Math.sqrt(2) / 3.0, -1.0 / 3),
        vec3(Math.sqrt(6) / 3.0, -1 * Math.sqrt(2) / 3.0, -1.0 / 3),
    ], divisions)
}

function getFromFile(path) {
    const file = loadFileAJAX(path)
    const lines = file.split('\n')

    let positions = []
    let elements = []
    let out = []

    for (let l = 0; l < lines.length; l++) {
        let strings = lines[l].trimRight().split(' ')

        switch (strings[0]) {
            case ('v'):
                positions.push(vec3(parseFloat(strings[1]), parseFloat(strings[2]), parseFloat(strings[3])))
                break
            case ('f'):
                elements.push(parseInt(strings[1]) - 1)
                elements.push(parseInt(strings[2]) - 1)
                elements.push(parseInt(strings[3]) - 1)
                break
        }
    }

    for (let i = 0; i < elements.length; i++) {
        out.push(positions[elements[i]])
    }

    return out
}

export {
    getPlane,
    getSphere,
    getFromFile,
}
