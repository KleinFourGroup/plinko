import * as PIXI from 'pixi.js'

import { AppState } from './app'
import { WorldChoice } from './worlds'
import { SelectorBar } from './select_world'

class GameMenu {
    gameApp: AppState
    stage: PIXI.Container
    bar: SelectorBar
    activeSelection: WorldChoice
    description: PIXI.Graphics

    constructor(gameApp: AppState) {
        this.gameApp = gameApp
        this.stage = new PIXI.Container()
        this.bar = new SelectorBar(this)
        
    }

    parseInput() {
        this.bar.parseInput()
    }
}

export {GameMenu}