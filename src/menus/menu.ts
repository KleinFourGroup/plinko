import * as PIXI from 'pixi.js'

import { AppState, MAX_STEPS, STEP } from '../app'
import { LevelSelectMenu } from './level_menu'

interface GameMenuI {
    gameApp: AppState
    stage: PIXI.Container

    parseInput(): void
    updateFrame(delta: number): void
    updateDisplay(renderWidth: number, renderHeight: number): void
}

class MenuState {
    gameApp: AppState
    stage: PIXI.Container
    levelSelect: LevelSelectMenu

    constructor(gameApp: AppState) {
        this.gameApp = gameApp
        this.stage = new PIXI.Container()
        this.levelSelect = new LevelSelectMenu(this.gameApp)
        this.stage.addChild(this.levelSelect.stage)
    }

    parseInput() {
        this.levelSelect.parseInput()
    }

    updateFrame(delta: number) {
        this.levelSelect.updateFrame(delta)
    }

    updateDisplay(renderWidth: number, renderHeight: number) {
        this.levelSelect.updateDisplay(renderWidth, renderHeight)
    }
}

export {GameMenuI, MenuState}