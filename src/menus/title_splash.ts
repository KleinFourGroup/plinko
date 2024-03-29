import * as PIXI from 'pixi.js'

import { AppState, MAX_STEPS, STEP } from '../app'
import { COLORS } from '../colors'
import { BIG_MARGIN, MARGIN } from '../cards'
import { GameMenuI, MenuState } from './menu'
import { GAME_TITLE, GAME_VERSION } from '../global_consts'


let titleStyle = new PIXI.TextStyle({
    fontFamily: "monospace",
    fill: COLORS["terminal green"],
    fontSize: 64
})

let versionStyle = new PIXI.TextStyle({
    wordWrap: true,
    wordWrapWidth: 1000,
    fontFamily: "monospace",
    fill: COLORS["terminal green"],
    fontSize: 14
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
    version: PIXI.Text
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
        this.title.anchor.set(0.5, 0.0)
        this.stage.addChild(this.title)

        this.version = new PIXI.Text(GAME_VERSION, versionStyle)
        this.version.anchor.set(1.0, 0.0)
        this.stage.addChild(this.version)

        this.prompt = new PIXI.Text("Click anywhere to procede...", proceedStyle)
        this.prompt.anchor.set(0.5, 0.0)
        this.stage.addChild(this.prompt)

        this.elapsed = 0
    }

    procede() {
        this.gameApp.soundManager.play("select", true)
        this.menuState.setMenu("mainMenu")
    }

    parseInput() {
        // Should be like this, but sound policy causes issues
        // let procede = false

        // for (const action of this.gameApp.inputs.bindings.keys()){
        //     if (this.gameApp.inputs.poll(action)) {
        //         this.gameApp.inputs.reset(action)
        //         procede = true
        //     }
        // }
        
        // if (procede) this.procede()

        if (this.gameApp.inputs.poll("SELECT")) {
            this.gameApp.inputs.reset("SELECT")
            this.procede()
        }
    }

    refresh() {}

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
        this.version.style.wordWrapWidth = this.title.width - MARGIN

        let splashHeight = this.title.height + MARGIN / 2 + this.version.height + BIG_MARGIN + this.prompt.height

        this.title.position.set(renderWidth / 2, (renderHeight - splashHeight) / 2)
        this.version.position.set(this.title.x + this.title.width / 2 - MARGIN, this.title.y + this.title.height + MARGIN / 2)
        this.prompt.position.set(renderWidth / 2, this.version.y + this.version.height + BIG_MARGIN)
    }
}

export {TitleSplashMenu}