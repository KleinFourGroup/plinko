import * as PIXI from 'pixi.js'

import { AppState, MAX_STEPS, STEP } from '../app'
import { COLORS } from '../colors'
import { BIG_MARGIN, MARGIN } from '../cards'
import { GameMenuI, MenuState } from './menu'
import { AppInteraction } from '../keyboard'
import { GAME_TITLE } from '../global_consts'


let titleStyle = new PIXI.TextStyle({
    fontFamily: "monospace",
    fill: COLORS["terminal green"],
    fontSize: 64
})

let proceedStyle = new PIXI.TextStyle({
    wordWrap: true,
    wordWrapWidth: 1000,
    fontFamily: "monospace",
    fill: COLORS["terminal green"],
    fontSize: 20
})

class TitleSplashMenu implements GameMenuI {
    gameApp: AppState
    menuState: MenuState
    stage: PIXI.Container
    title: PIXI.Text
    prompt: PIXI.Text
    elapsed: number

    constructor(menuState: MenuState) {
        this.menuState = menuState
        this.gameApp = this.menuState.gameApp
        this.stage = new PIXI.Container()
        this.stage.eventMode = "static"
        this.stage.hitArea = new PIXI.Rectangle(0, 0)
        this.stage.on("pointerdown", (event) => {
            this.procede()
        })

        this.title = new PIXI.Text(GAME_TITLE, titleStyle)
        this.title.anchor.set(0.5, 1.0)
        this.stage.addChild(this.title)

        this.prompt = new PIXI.Text("Click anywhere to procede...", proceedStyle)
        this.prompt.anchor.set(0.5, 0.0)
        this.stage.addChild(this.prompt)

        this.elapsed = 0
    }

    procede() {
        this.gameApp.soundManager.play("select", true)
        this.menuState.setMenu("levelSelect")
    }

    parseInput() {
        if (this.gameApp.inputs.poll(AppInteraction.SELECT)) {
            this.gameApp.inputs.reset(AppInteraction.SELECT)
            this.gameApp.inputs.reset(AppInteraction.MENU) // Hacky
            this.procede()
        }
    }

    updateFrame(delta: number) {
        let steps = this.gameApp.timing.getSteps(STEP)
        this.gameApp.timing.step(steps, STEP)

        this.elapsed += this.gameApp.timing.delta
        this.prompt.alpha = (Math.cos(this.elapsed * 2 * Math.PI / 3000) + 1) / 2
    }

    updateDisplay(renderWidth: number, renderHeight: number) {

        (this.stage.hitArea as PIXI.Rectangle).width = renderWidth;
        (this.stage.hitArea as PIXI.Rectangle).height = renderHeight;

        let width = Math.min(renderWidth, renderHeight * 16 / 9)
        this.prompt.style.wordWrapWidth = width

        this.title.position.set(renderWidth / 2, (renderHeight - BIG_MARGIN) / 2)
        this.prompt.position.set(renderWidth / 2, (renderHeight + BIG_MARGIN) / 2)
    }
}

export {TitleSplashMenu}