import * as PIXI from 'pixi.js'

import { GameState } from '../game_state'
import { ContinueGame, EndlessEvent, GotoMenuEvent, RestartEvent } from '../events'
import { MARGIN, makePromptCard, makeSimpleCard, makeSmallCard } from '../cards'
import { SelectorBase, SelectorCallback, SelectorDirection } from './select'
import { AppState } from '../app'
import { LevelSelectMenu } from '../menu'

const DIFFICULTIES = [
    5,
    10,
    25,
    50,
    100
]

class DifficultySelect extends SelectorBase {
    box: PIXI.Container
    menu: LevelSelectMenu
    constructor(menu: LevelSelectMenu) {
        let choices: Array<PIXI.Container> = []
        let onSelects: Array<SelectorCallback> = []
        let onHighlights: Array<SelectorCallback> = []

        for (let level of DIFFICULTIES) {
            let graphics = makeSmallCard(`${level}`)
            choices.push(graphics)
            onSelects.push(null)
            onHighlights.push((gameApp: AppState) => {gameApp.levels = level})
        }

        super(menu.gameApp, choices, onSelects, onHighlights, SelectorDirection.HORIZONTAL)

        this.menu = menu
        
        this.box = new PIXI.Container()
        this.menu.stage.addChild(this.box)
        
        for (let choice of this.choices) {
            if (this.box.width === 0) {
                choice.position.set(0, 0)
            } else {
                choice.position.set(this.box.width + MARGIN, 0)
            }

            this.box.addChild(choice)
        }

        this.box.addChild(this.selector)

        this.highlight(this.choices[0], false)
    }
}

export {DifficultySelect}