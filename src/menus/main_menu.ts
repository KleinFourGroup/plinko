import * as PIXI from 'pixi.js'

import { AppState, MAX_STEPS, STEP } from '../app'
import { COLORS } from '../colors'
import { BIG_MARGIN, MARGIN } from '../cards'
import { GameMenuI, MenuState } from './menu'
import { AppInteraction } from '../keyboard'
import { GAME_TITLE } from '../global_consts'
import { SelectorMainMenu } from '../selector/select_main'


let titleStyle = new PIXI.TextStyle({
    fontFamily: "monospace",
    fill: COLORS["terminal green"],
    fontSize: 64
})

class MainMenu implements GameMenuI {
    gameApp: AppState
    menuState: MenuState
    stage: PIXI.Container
    title: PIXI.Text
    bar: SelectorMainMenu

    constructor(menuState: MenuState) {
        this.menuState = menuState
        this.gameApp = this.menuState.gameApp
        this.stage = new PIXI.Container()

        this.title = new PIXI.Text(GAME_TITLE, titleStyle)
        this.title.anchor.set(0.5, 0)
        this.stage.addChild(this.title)

        this.bar = new SelectorMainMenu(this)
    }

    parseInput() {
        this.bar.parseInput()
    }

    updateFrame(delta: number) {
    }

    updateDisplay(renderWidth: number, renderHeight: number) {
        // let width = Math.min(renderWidth, renderHeight * 16 / 9)

        let menuHeight = 2 * BIG_MARGIN + this.title.height + this.bar.box.height

        this.title.position.set(renderWidth / 2, (renderHeight - menuHeight) / 2)

        this.bar.box.position.set(
            (renderWidth - this.bar.box.width) / 2,
            (renderHeight + menuHeight) / 2 - this.bar.box.height
        )
    }
}

export {MainMenu}