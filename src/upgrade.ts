import * as PIXI from 'pixi.js'

import { COLORS } from './colors'
import { GameState } from './game_state'

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
        this.graphics = this.makeGraphics()
    }

    makeGraphics() {
        let titleStyle = new PIXI.TextStyle({
            wordWrap: true,
            wordWrapWidth: 400,
            fontFamily: "monospace",
            fill: COLORS["terminal green"]
        })
        let title = new PIXI.Text(this.title, titleStyle)

        let descStyle = new PIXI.TextStyle({
            wordWrap: true,
            wordWrapWidth: 400,
            fontFamily: "monospace",
            fill: COLORS["terminal green"],
            fontSize: 20
        })
        let description = new PIXI.Text(this.description, descStyle)

        let margin = 10
        let width = 400 + 2 * margin
        let height = title.height + description.height + 3 * margin

        let backBox = new PIXI.Graphics()

        backBox.lineStyle(3, COLORS["terminal green"])
        backBox.beginFill(COLORS["dark terminal green"])
        backBox.drawRect(0, 0, width, height)
        backBox.endFill()

        let card = new PIXI.Container()
        card.addChild(backBox)
        card.addChild(title)
        title.position.set(margin, margin)
        card.addChild(description)
        description.position.set(margin, title.height + 2 * margin)
        card.eventMode = "static"

        return card
    }

    apply(gameState: GameState) {
        if (this.effect !== null) {
            this.effect(gameState)
        } else {
            console.log("Upgrade has no effect!")
        }
    }

}

export {UpgradeSignature, Upgrade}