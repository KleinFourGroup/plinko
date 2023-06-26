import * as PIXI from 'pixi.js'

import { GameState } from './game_state'
import { ContinueGame, RestartEvent } from './events'
import { makePromptCard, makeSimpleCard } from './cards'

class RestartSelect {
    box: PIXI.Container
    gameState: GameState
    prompt: PIXI.Container
    restartGraphics: PIXI.Container
    continueGraphics: PIXI.Container
    constructor(gameState: GameState) {
        this.box = new PIXI.Container()
        this.gameState = gameState
        this.prompt = makePromptCard("GAME OVER")
        this.prompt.position.set(0, 0)
        this.restartGraphics = makeSimpleCard("Restart")
        this.restartGraphics.position.set(0, 15 + this.prompt.height)
        this.continueGraphics = makeSimpleCard("Continue")
        this.continueGraphics.position.set(0, 15 + this.restartGraphics.y + this.restartGraphics.height)

        this.restartGraphics.on("pointerdown", (event) => {
            event.stopPropagation()
            this.restartWorld()
        })
        this.continueGraphics.on("pointerdown", (event) => {
            event.stopPropagation()
            this.continueWorld()
        })
    }

    get activated() {
        return this.box.height !== 0
    }

    activate() {
        this.box.addChild(this.prompt)
        this.box.addChild(this.restartGraphics)
        this.box.addChild(this.continueGraphics)
    }

    deactivate() {
        this.box.removeChild(this.prompt)
        this.box.removeChild(this.restartGraphics)
        this.box.removeChild(this.continueGraphics)
    }

    restartWorld() {
        this.gameState.enqueueEvent(new RestartEvent())
        this.deactivate()
    }

    continueWorld() {
        this.gameState.enqueueEvent(new ContinueGame(this.gameState.continues + 1))
        this.deactivate()
    }
}

export {RestartSelect}