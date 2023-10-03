import * as PIXI from 'pixi.js'

import { AppState, MAX_STEPS, STEP } from '../app'
import { COLORS } from '../colors'
import { BIG_MARGIN, MARGIN } from '../cards'
import { GameMenuI, MenuState } from './menu'
import { GAME_TITLE } from '../global_consts'
import keyBindings from "../bindings.json"

const CONTROLS_WIDTH = 600

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

let headingStyle = new PIXI.TextStyle({
    wordWrap: true,
    wordWrapWidth: CONTROLS_WIDTH,
    fontFamily: "monospace",
    fill: COLORS["terminal amber"],
    fontSize: 40
})

let itemStyle = new PIXI.TextStyle({
    wordWrap: true,
    wordWrapWidth: CONTROLS_WIDTH,
    fontFamily: "monospace",
    fill: COLORS["terminal green"],
    fontSize: 20
})

class ControlsMenu implements GameMenuI {
    gameApp: AppState
    menuState: MenuState
    stage: PIXI.Container
    controls: PIXI.Container
    actions: Array<PIXI.Text>
    bindings: Array<PIXI.Text>
    header: PIXI.Text
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

        this.controls = new PIXI.Container()
        this.stage.addChild(this.controls)

        this.header = new PIXI.Text("Controls", headingStyle)
        this.header.anchor.set(0.5, 0)
        this.header.position.set(CONTROLS_WIDTH / 2, 0)
        this.controls.addChild(this.header)

        this.actions = []
        this.bindings = []

        for (const [interaction, key] of Object.entries(keyBindings)) {
            let textY = this.controls.height + MARGIN
            let action = new PIXI.Text(interaction, itemStyle)
            action.anchor.set(0, 0)
            action.position.set(0, textY)
            this.controls.addChild(action)

            let binding = new PIXI.Text(`"${key}"`, itemStyle)
            binding.anchor.set(1, 0)
            binding.position.set(CONTROLS_WIDTH, textY)
            this.controls.addChild(binding)

            this.actions.push(action)
            this.bindings.push(binding)
        }

        this.title = new PIXI.Text(GAME_TITLE, titleStyle)
        this.title.anchor.set(0.5, 0.0)
        this.stage.addChild(this.title)

        this.prompt = new PIXI.Text("Click anywhere to procede...", proceedStyle)
        this.prompt.anchor.set(0.5, 1.0)
        this.stage.addChild(this.prompt)

        this.elapsed = 0
    }

    procede() {
        this.gameApp.soundManager.play("select", true)
        this.menuState.setMenu("mainMenu")
    }

    parseInput() {
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

        this.title.position.set(renderWidth / 2, BIG_MARGIN)
        this.prompt.position.set(renderWidth / 2, renderHeight - BIG_MARGIN)
        this.controls.position.set(
            (renderWidth - this.controls.width) / 2,
            (renderHeight - this.controls.height) / 2
        )
    }
}

export {ControlsMenu}