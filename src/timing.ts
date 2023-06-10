import * as PIXI from 'pixi.js'

class TimingManager {
    app: PIXI.Application
    elapsed: number
    lastStep: number
    startWork: number
    prevWork: number
    intervalsWork: Array<number>
    intervalsTotal: Array<number>

    constructor(app: PIXI.Application) {
        this.app = app
        this.elapsed = 0.0
        this.lastStep = 0
        this.prevWork = 0
        this.intervalsWork = []
        this.intervalsTotal = []
    }

    get load() {
        return this.intervalsWork.reduce((a, b) => a + b, 0) / this.intervalsTotal.reduce((a, b) => a + b, 0)
    }

    get delta() {
        return this.app.ticker.deltaMS
    }

    beginFrame() {
        let deltaMS = this.app.ticker.deltaMS
        this.intervalsTotal.push(deltaMS)
        this.intervalsWork.push(this.prevWork)

        if (this.intervalsTotal.length > 20) {
            this.intervalsTotal.shift()
            this.intervalsWork.shift()
        }

        this.elapsed += deltaMS
    }

    beginWork() {
        this.startWork = performance.now()
    }

    endWork() {
        this.prevWork = performance.now() - this.startWork
    }

    needsStep(rate: number) {
        return (this.elapsed - this.lastStep >= rate)
    }

    step() {
        this.lastStep = Math.floor(this.elapsed)
    }
}

export {TimingManager}