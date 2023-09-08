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

let notifyStyle = new PIXI.TextStyle({
    wordWrap: true,
    wordWrapWidth: 1000,
    fontFamily: "monospace",
    fill: COLORS["terminal green"],
    fontSize: 20
})

const NOTIFY_LENGTH = 1000

class MainMenu implements GameMenuI {
    gameApp: AppState
    menuState: MenuState
    stage: PIXI.Container
    title: PIXI.Text
    progress: PIXI.Text
    elapsed: number
    bar: SelectorMainMenu

    constructor(menuState: MenuState) {
        this.menuState = menuState
        this.gameApp = this.menuState.gameApp
        this.stage = new PIXI.Container()

        this.title = new PIXI.Text(GAME_TITLE, titleStyle)
        this.title.anchor.set(0.5, 0)
        this.stage.addChild(this.title)

        this.progress = new PIXI.Text("Progress reset!", notifyStyle)
        this.progress.anchor.set(0.5, 1.0)
        this.stage.addChild(this.progress)

        this.elapsed = NOTIFY_LENGTH

        this.bar = new SelectorMainMenu(this)
    }

    reset() {
        this.elapsed = 0
        // TODO: Progression logic
    }

    parseInput() {
        this.bar.parseInput()
    }

    updateFrame(delta: number) {
        this.elapsed = Math.min(NOTIFY_LENGTH, this.elapsed + this.gameApp.timing.delta)
        this.progress.alpha = Math.sin(this.elapsed * Math.PI / NOTIFY_LENGTH)
    }

    updateDisplay(renderWidth: number, renderHeight: number) {
        let width = Math.min(renderWidth, renderHeight * 16 / 9)

        let menuHeight = 2 * BIG_MARGIN + this.title.height + this.bar.box.height

        this.title.position.set(renderWidth / 2, (renderHeight - menuHeight) / 2)

        this.bar.box.position.set(
            (renderWidth - this.bar.box.width) / 2,
            (renderHeight + menuHeight) / 2 - this.bar.box.height
        )
        
        this.progress.style.wordWrapWidth = width

        this.progress.position.set(renderWidth / 2, renderHeight - BIG_MARGIN)
    }
}

export {MainMenu}