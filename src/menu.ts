import * as PIXI from 'pixi.js'

import { AppMode, AppState } from './app'
import { WORLD_LIST, WorldChoice } from './worlds'
import { AppInteraction } from './keyboard'

class GameMenu {
    gameApp: AppState
    stage: PIXI.Container
    activeSelection: WorldChoice
    width: number
    heigt: number
    selector: PIXI.Graphics
    description: PIXI.Graphics

    constructor(gameApp: AppState) {
        this.gameApp = gameApp
    }

    parseInput() {
        if (this.gameApp.inputs.poll(AppInteraction.SELECT)) {
            console.log("Going to game...")
            this.gameApp.setMode(AppMode.GAME)
            this.gameApp.replaceWorld(WORLD_LIST[0].init)
        }
    }
}

export {GameMenu}