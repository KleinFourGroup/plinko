import * as PIXI from 'pixi.js'
import { GameState } from './game_state'

type TimerSignature = {
    id: string,
    start: number,
    duration: number
    callback: (state: GameState) => void
}

class TimingManager {
    app: PIXI.Application
    elapsed: number
    lastStep: number
    startWork: number
    prevWork: number
    intervalsWork: Array<number>
    intervalsTotal: Array<number>

    timers: Array<TimerSignature>

    constructor(app: PIXI.Application) {
        this.app = app
        this.elapsed = 0.0
        this.lastStep = 0
        this.prevWork = 0
        this.intervalsWork = []
        this.intervalsTotal = []
        this.timers = []
    }

    get load() {
        return this.intervalsWork.reduce((a, b) => a + b, 0) / this.intervalsTotal.reduce((a, b) => a + b, 0)
    }

    get delta() {
        return this.app.ticker.deltaMS
    }

    beginFrame() {
        let deltaMS = this.app.ticker.deltaMS
        this.elapsed += deltaMS

        this.intervalsTotal.push(deltaMS)
        this.intervalsWork.push(this.prevWork)

        if (this.intervalsTotal.length > 20) {
            this.intervalsTotal.shift()
            this.intervalsWork.shift()
        }
    }

    beginWork() {
        this.startWork = performance.now()
    }

    runTimers(gameState: GameState) {
        for (let timer of this.timers) {
            if (this.elapsed - timer.start >=  timer.duration) {
                if (timer.callback !== null) timer.callback(gameState)
            }
        }

        this.timers = this.timers.filter((timer: TimerSignature) => (this.elapsed - timer.start <  timer.duration))
    }

    clearTimers() {
        this.timers = []
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

    createTimer(id: string, duration: number, callback: (state: GameState) => void = null) {
        let sig: TimerSignature = {
            id: id,
            start: this.elapsed,
            duration: duration,
            callback: callback
        }

        this.timers.push(sig)
    }
}

export {TimingManager}