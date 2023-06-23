import * as PIXI from 'pixi.js'

import { COLORS } from './colors'
import { GameState } from './game_state'
import { Upgrade } from './upgrade'
import { ContinueGame } from './events'

function makeBox(text: string) {
    let textBox = new PIXI.Container()

    let choiceStyle = new PIXI.TextStyle({
        wordWrap: true,
        wordWrapWidth: 400,
        fontFamily: "monospace",
        fill: COLORS["terminal green"]
    })

    let displayText = new PIXI.Text(text, choiceStyle)

    let margin = 10
    let width = 400 + 2 * margin
    let height = displayText.height + 2 * margin

    let backBox = new PIXI.Graphics()
    backBox.lineStyle(3, COLORS["terminal green"])
    backBox.beginFill(COLORS["dark terminal green"])
    backBox.drawRect(0, 0, width, height)
    backBox.endFill()

    textBox.addChild(backBox)
    displayText.position.set(margin, margin)
    textBox.addChild(displayText)

    textBox.eventMode = 'static'

    return textBox
}

class RestartSelect {
    box: PIXI.Container
    gameState: GameState
    restartGraphics: PIXI.Container
    continueGraphics: PIXI.Container
    constructor(gameState: GameState) {
        this.box = new PIXI.Container()
        this.gameState = gameState
        this.restartGraphics = makeBox("Restart")
        this.restartGraphics.position.set(0, 0)
        this.continueGraphics = makeBox("Continue")
        this.continueGraphics.position.set(0, 15 + this.restartGraphics.height)

        this.restartGraphics.on("pointerdown", (event) => {
            event.stopPropagation()
            console.error("Restart")
        })
        this.continueGraphics.on("pointerdown", (event) => {
            event.stopPropagation()
            this.gameState.enqueueEvent(new ContinueGame(this.gameState.continues + 1))
            this.deativate()
        })
    }

    activate() {
        this.box.addChild(this.restartGraphics)
        this.box.addChild(this.continueGraphics)
    }

    deativate() {
        this.box.removeChild(this.restartGraphics)
        this.box.removeChild(this.continueGraphics)
    }
}

export {RestartSelect}