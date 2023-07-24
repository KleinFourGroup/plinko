import * as PIXI from 'pixi.js'

import { UserInterface } from './ui'
import { GameState } from './game_state'
import { COLORS } from './colors'

interface UIFX {
    box: PIXI.Container
    gameX: number
    gameY: number
    elapsed: number
    update(deltaMS: number): boolean
    destroy(): void
}

let scoreStyle = new PIXI.TextStyle({
    fontFamily: "monospace",
    fill: COLORS["terminal green"],
    fontSize: 16
})

class ScoreFX implements UIFX {
    box: PIXI.Container
    gameX: number
    gameY: number
    elapsed: number
    text: PIXI.Text
    duration: number
    rise: number
    constructor(text: string, x: number, y: number, duration: number = 1000, rise: number = 50) {
        this.text = new PIXI.Text(text, scoreStyle) 
        this.text.anchor.set(0.5, 0.5)
        // this.text.alpha = 0

        this.box = new PIXI.Container()
        this.box.addChild(this.text)

        this.gameX = x
        this.gameY = y

        this.elapsed = 0
        this.duration = duration
        this.rise = rise
    }

    update(deltaMS: number) {
        this.elapsed += deltaMS
        if (this.elapsed >= this.duration) return false

        this.text.alpha = Math.sin(this.elapsed * Math.PI / this.duration)
        this.text.y = -this.rise * this.elapsed / this.duration

        return true
    }
    destroy() {
        this.text.destroy()
    }
}

class FXStage {
    parent: GameState
    stage: PIXI.Container
    effects: Array<UIFX>

    constructor(parent: GameState) {
        this.parent = parent
        this.stage = new PIXI.Container()
        this.parent.box.addChild(this.stage)
        
        this.effects = []
    }

    register(effect: UIFX) {
        this.effects.push(effect)
        this.stage.addChild(effect.box)

        effect.box.position.set(
            effect.gameX * this.parent.stage.scale.x + this.parent.stage.x, 
            effect.gameY * this.parent.stage.scale.y + this.parent.stage.y
        )
    }

    update(deltaMS: number) {
        let toDelete: Array<UIFX> = []
        for (let effect of this.effects) {
            let isActive = effect.update(deltaMS)
            if (!isActive) {
                toDelete.push(effect)
            } else {
                effect.box.position.set(
                    effect.gameX * this.parent.stage.scale.x + this.parent.stage.x, 
                    effect.gameY * this.parent.stage.scale.y + this.parent.stage.y
                )
            }
        }

        for (let effect of toDelete) {
            this.effects.splice(this.effects.indexOf(effect), 1)
            this.stage.removeChild(effect.box)
            effect.destroy()
        }
    }

    destroy() {
        for (let effect of this.effects) {
            effect.destroy()
        }
    }
}

export {UIFX, ScoreFX, FXStage}