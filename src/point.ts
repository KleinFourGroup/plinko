type Point = {
    x: number,
    y: number
}

type ParametricFn = (timeMS: number) => Point

class TimedPath {
    time: number
    path: ParametricFn

    constructor(path: ParametricFn) {
        this.path = path;
        this.time = 0
    }

    setTime(time: number) {
        this.time = time
    }

    update(deltaMS: number) {
        this.time += deltaMS
    }

    position() {
        return this.path(this.time)
    }
}

export {Point, ParametricFn, TimedPath}