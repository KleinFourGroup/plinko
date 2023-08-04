import * as PIXI from 'pixi.js'

import { GameState } from '../game_state'
import { ContinueGame, RestartEvent } from '../events'
import { makePromptCard, makeSimpleCard } from '../cards'
import { SelectorBase, SelectorCallback } from './select'
import { AppState } from '../app'

class WinSelect extends SelectorBase {
    box: PIXI.Container
    gameState: GameState
    prompt: PIXI.Container
    newGraphics: PIXI.Container
    restartGraphics: PIXI.Container
    continueGraphics: PIXI.Container
    constructor(gameState: GameState) {
        let choices: Array<PIXI.Container> = []
        let onSelects: Array<SelectorCallback> = []
        let onHighlights: Array<SelectorCallback> = []

        let newGraphics = makeSimpleCard("New Level")
        let newSelect = (gameApp: AppState) => {
            this.newWorld()
        }
        choices.push(newGraphics)
        onSelects.push(newSelect)
        onHighlights.push(null)

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
        this.prompt = makePromptCard("LEVEL COMPLETED")
        this.prompt.position.set(0, 0)
        this.newGraphics = newGraphics
        this.newGraphics.position.set(0, 15 + this.prompt.height)
        this.restartGraphics = restartGraphics
        this.restartGraphics.position.set(0, 15 + this.newGraphics.y + this.newGraphics.height)
        this.continueGraphics = continueGraphics
        this.continueGraphics.position.set(0, 15 + this.restartGraphics.y + this.restartGraphics.height)

        this.highlight(this.newGraphics, false)
    }

    get isActive() {
        return this.box.height !== 0
    }

    activate() {
        this.box.addChild(this.prompt)
        this.box.addChild(this.newGraphics)
        this.box.addChild(this.restartGraphics)
        this.box.addChild(this.continueGraphics)
        this.box.addChild(this.selector)

        this.highlight(this.newGraphics)
    }

    deactivate() {
        this.box.removeChild(this.prompt)
        this.box.removeChild(this.newGraphics)
        this.box.removeChild(this.restartGraphics)
        this.box.removeChild(this.continueGraphics)
        this.box.removeChild(this.selector)
    }

    newWorld() {
        // TODO
        this.deactivate()
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

export {WinSelect}