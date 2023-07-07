import * as PIXI from 'pixi.js'

import { GameState } from './game_state'
import { ContinueGame, RestartEvent } from './events'
import { makePromptCard, makeSimpleCard } from './cards'
import { SelectorBase, SelectorCallback } from './select'
import { AppState } from './app'

class RestartSelect extends SelectorBase {
    box: PIXI.Container
    gameState: GameState
    prompt: PIXI.Container
    restartGraphics: PIXI.Container
    continueGraphics: PIXI.Container
    constructor(gameState: GameState) {
        let choices: Array<PIXI.Container> = []
        let onSelects: Array<SelectorCallback> = []
        let onHighlights: Array<SelectorCallback> = []

        let restartGraphics = makeSimpleCard("Restart")
        let restartSelect = (gameApp: AppState) => {
            this.restartWorld()
        }
        choices.push(restartGraphics)
        onSelects.push(restartSelect)
        onHighlights.push(null)
        
        let continueGraphics = makeSimpleCard("Continue")
        let continueSelect = (gameApp: AppState) => {
            this.continueWorld()
        }
        choices.push(continueGraphics)
        onSelects.push(continueSelect)
        onHighlights.push(null)

        super(gameState.gameApp, choices, onSelects, onHighlights)

        this.box = new PIXI.Container()
        this.gameState = gameState
        this.prompt = makePromptCard("GAME OVER")
        this.prompt.position.set(0, 0)
        this.restartGraphics = restartGraphics
        this.restartGraphics.position.set(0, 15 + this.prompt.height)
        this.continueGraphics = continueGraphics
        this.continueGraphics.position.set(0, 15 + this.restartGraphics.y + this.restartGraphics.height)

        this.highlight(this.restartGraphics)
    }

    get isActive() {
        return this.box.height !== 0
    }

    activate() {
        this.box.addChild(this.prompt)
        this.box.addChild(this.restartGraphics)
        this.box.addChild(this.continueGraphics)
        this.box.addChild(this.selector)

        this.highlight(this.restartGraphics)
    }

    deactivate() {
        this.box.removeChild(this.prompt)
        this.box.removeChild(this.restartGraphics)
        this.box.removeChild(this.continueGraphics)
        this.box.removeChild(this.selector)
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