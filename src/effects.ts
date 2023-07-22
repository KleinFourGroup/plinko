import * as PIXI from 'pixi.js'

import { UserInterface } from './ui'

interface UIFX {
    box: PIXI.Container
    gameX: number
    gameY: number
    elapsed: number
    update(deltaMS: number): boolean
    destroy(): void
}

class FXStage {
    parent: UserInterface
    stage: PIXI.Container
    effects: Array<UIFX>

    constructor(parent: UserInterface) {
        this.parent = parent
        this.stage = new PIXI.Container()
    }

    register(effect: UIFX) {
        this.effects.push(effect)
        this.stage.addChild(effect.box)
    }

    update(deltaMS: number) {
        let toDelete: Array<UIFX> = []
        for (let effect of this.effects) {
            let isActive = effect.update(deltaMS)
            if (!isActive) toDelete.push(effect)
        }

        for (let effect of toDelete) {
            this.effects.splice(this.effects.indexOf(effect), 1)
        }
    }

    destroy() {
        for (let effect of this.effects) {
            effect.destroy()
        }
    }
}