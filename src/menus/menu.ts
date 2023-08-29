import * as PIXI from 'pixi.js'

import { AppState, MAX_STEPS, STEP } from '../app'
import { LevelSelectMenu } from './level_menu'
import { TitleSplashMenu } from './title_splash'

interface GameMenuI {
    gameApp: AppState
    menuState: MenuState
    stage: PIXI.Container

    parseInput(): void
    updateFrame(delta: number): void
    updateDisplay(renderWidth: number, renderHeight: number): void
}

class MenuState {
    gameApp: AppState
    stage: PIXI.Container
    menus: Map<string, GameMenuI>
    currMenu: GameMenuI

    constructor(gameApp: AppState) {
        this.gameApp = gameApp
        this.stage = new PIXI.Container()
        this.menus = new Map<string, GameMenuI>()
        this.menus.set("titleSplash", new TitleSplashMenu(this))
        this.menus.set("levelSelect", new LevelSelectMenu(this))
        this.currMenu = null

        this.setMenu("titleSplash")
    }

    setMenu(menuID: string) {
        let newMenu = this.menus.get(menuID)
        if (this.currMenu !== null) {
            this.stage.removeChild(this.currMenu.stage)
        }

        this.currMenu = newMenu
        this.stage.addChild(this.currMenu.stage)
    }

    parseInput() {
        this.currMenu.parseInput()
    }

    updateFrame(delta: number) {
        this.currMenu.updateFrame(delta)
    }

    updateDisplay(renderWidth: number, renderHeight: number) {
        this.currMenu.updateDisplay(renderWidth, renderHeight)
    }
}

export {GameMenuI, MenuState}