function getRandomInRange(min, max, sign) {
    let factor = 1
    if (sign) {
        let k = Math.floor(Math.random() * 10)
        if (k % 2 === 0) factor = -1
    }
    return factor * (min + (Math.random() * (max - min)))
}

export {
    getRandomInRange
}