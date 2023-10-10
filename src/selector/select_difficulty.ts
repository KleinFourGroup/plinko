import * as PIXI from 'pixi.js'

import { GameState } from '../game_state'
import { ContinueGame, EndlessEvent, GotoMenuEvent, RestartEvent } from '../events'
import { BORDER, MARGIN, makePromptCard, makeSimpleCard, makeSmallCard, makeSmallPromptCard } from '../cards'
import { SelectorBase, SelectorCallback, SelectorDirection } from './select'
import { AppState } from '../app'
import { LevelSelectMenu } from '../menus/level_menu'

const DIFFICULTIES = [
    5,
    10,
    25,
    50,
    100
]

class DifficultySelect extends SelectorBase {
    box: PIXI.Container
    prompt: PIXI.Container
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
        this.menu.selectStage.addChild(this.box)

        this.prompt = makeSmallPromptCard("Difficulty")

        this.prompt.position.set(0, 0)
        this.box.addChild(this.prompt)
        
        for (let choice of this.choices) {
            choice.position.set(this.box.width + MARGIN, (this.prompt.height - 2 * BORDER - choice.height) / 2)

            this.box.addChild(choice)
        }

        this.box.addChild(this.selector)

        this.highlight(this.choices[0], false)
    }
}

export {DifficultySelect}