import * as PIXI from 'pixi.js'

import { GameState } from '../game_state'
import { ContinueGame, EndlessEvent, GotoMenuEvent, RestartEvent } from '../events'
import { makePromptCard, makeSimpleCard, makeSmallCard } from '../cards'
import { SelectorBase, SelectorCallback } from './select'
import { AppState } from '../app'

const DIFFICULTIES = [
    5,
    10,
    25,
    50,
    100
]

class DifficultySelect extends SelectorBase {
    box: PIXI.Container
    gameState: GameState
    prompt: PIXI.Container
    level: number
    constructor(gameState: GameState) {
        let choices: Array<PIXI.Container> = []
        let onSelects: Array<SelectorCallback> = []
        let onHighlights: Array<SelectorCallback> = []

        for (let level of DIFFICULTIES) {
            let graphics = makeSmallCard(`${level}`)
            choices.push(graphics)
            onSelects.push(null)
            onHighlights.push((gameApp: AppState) => {this.level = level})
        }

        super(gameState.gameApp, choices, onSelects, onHighlights)

        this.box = new PIXI.Container()
        this.gameState = gameState
        this.prompt = makePromptCard("Level Length")
        this.prompt.position.set(0, 0)
        

        this.highlight(this.choices[0], false)
    }

    get isActive() {
        return this.box.height !== 0
    }

    activate() {
        this.box.addChild(this.prompt)
        // TODO
        this.box.addChild(this.selector)

        this.highlight(this.choices[0])
    }

    deactivate() {
        this.box.removeChild(this.prompt)
        // TODO
        this.box.removeChild(this.selector)
    }

    newWorld() {
        this.gameState.enqueueEvent(new GotoMenuEvent())
        this.deactivate()
    }

    restartWorld() {
        this.gameState.enqueueEvent(new RestartEvent())
        this.deactivate()
    }

    continueWorld() {
        this.gameState.enqueueEvent(new EndlessEvent(this.gameState.levelState.level))
        this.deactivate()
    }
}

export {DifficultySelect}