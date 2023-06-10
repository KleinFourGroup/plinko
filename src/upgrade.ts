import * as PIXI from 'pixi.js'

import { COLORS } from './colors'
import { GameState } from './game_state'
import { Bouncer } from './physics_objects'

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
            wordWrapWidth: 400
        })
        let title = new PIXI.Text(this.title, titleStyle)

        let descStyle = new PIXI.TextStyle({
            wordWrap: true,
            wordWrapWidth: 400
        })
        let description = new PIXI.Text(this.description, descStyle)

        let margin = 10
        let width = 400 + 2 * margin
        let height = title.height + description.height + 3 * margin

        let backBox = new PIXI.Graphics()

        backBox.beginFill(COLORS["dark terminal amber"])
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
            console.error("Upgrade has no effect!")
        }
    }
}

function addBouncer(gameState: GameState) {
    let index = Math.floor(Math.random() * gameState.pegArray.pegs.length)
    let oldPeg = gameState.pegArray.pegs[index]
    let bouncer = new Bouncer(this.world, oldPeg.body.position.x, oldPeg.body.position.y, 10)
    gameState.pegArray.replace(index, bouncer)
}

export {Upgrade}