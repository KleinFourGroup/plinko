import * as PIXI from 'pixi.js'

import { COLORS } from './colors'
import { GameState } from './game_state'
import { makeUpgradeCard } from './cards'

type UpgradeSignature = {
    weight: number
    magnitude: (state: GameState) => number
    title: (magnitude: number, state: GameState) => string
    description: (magnitude: number, state: GameState) => string
    effect: (magnitude: number, state: GameState) => (state: GameState) => void
}

class Upgrade {
    title: string
    description: string
    graphics: PIXI.DisplayObject
    effect: (state: GameState) => void
    constructor(title: string, description: string, effect: (state: GameState) => void = null) {
        this.title = title
        this.description = description
        this.effect = effect
        this.graphics = makeUpgradeCard(this.title, this.description)
    }

    apply(gameState: GameState) {
        console.log(`Applying upgrade '${this.title}'`)
        if (this.effect !== null) {
            this.effect(gameState)
        } else {
            console.log("Upgrade has no effect!")
        }
    }

}

export {UpgradeSignature, Upgrade}