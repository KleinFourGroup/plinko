import * as PIXI from 'pixi.js'

import { AppState, MAX_STEPS, STEP } from '../app'
import { COLORS } from '../colors'
import { BIG_MARGIN, MARGIN } from '../cards'
import { GameMenuI, MenuState } from './menu'
import { AppInteraction } from '../keyboard'
import { GAME_TITLE } from '../global_consts'
import creditsData from './credits.json'

const CREDITS_WIDTH = 600
const PAUSE_TIME = 1000
const RATE = 100

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
    wordWrapWidth: CREDITS_WIDTH,
    fontFamily: "monospace",
    fill: COLORS["terminal amber"],
    fontSize: 40
})

let itemStyle = new PIXI.TextStyle({
    wordWrap: true,
    wordWrapWidth: CREDITS_WIDTH,
    fontFamily: "monospace",
    fill: COLORS["terminal green"],
    fontSize: 20
})

class CreditViewPort {
    stage: PIXI.Container
    credits: PIXI.Container
    mask: PIXI.Graphics
    deltaMS: number
    offset: number
    pauseTime: number
    paused: boolean

    constructor(stage: PIXI.Container) {
        this.stage = stage

        this.deltaMS = 0
        this.offset = 0
        this.pauseTime = 0
        this.paused = true

        this.credits = new PIXI.Container()
        for (const [heading, people] of Object.entries(creditsData)) {
            let headingText = new PIXI.Text(heading, headingStyle)
            headingText.anchor.set(0.5, 0)
            let headingY = this.credits.height
            if (headingY > 0) headingY += BIG_MARGIN
            headingText.position.set(CREDITS_WIDTH / 2, headingY)
            this.credits.addChild(headingText)

            for (let item of people) {
                let itemText = new PIXI.Text(item, itemStyle)
                itemText.anchor.set(0.5, 0)
                let itemY = this.credits.height + MARGIN
                itemText.position.set(CREDITS_WIDTH / 2, itemY)
                this.credits.addChild(itemText)
            }
        }
        this.stage.addChild(this.credits)

        this.mask = new PIXI.Graphics()
        this.mask.beginFill(0xFFFFFF)
        this.mask.drawRect(0, 0, 100, 100)
        this.mask.endFill()
        this.stage.addChild(this.mask)
        this.credits.mask = this.mask
    }

    setMask(x: number, y: number, width: number, height: number) {
        this.mask.clear()
        this.mask.beginFill(0xFFFFFF)
        this.mask.drawRect(0, 0, width, height)
        this.mask.endFill()
        this.mask.position.set(x, y)
    }

    placeCredits() {
        let renderWidth = (this.stage.hitArea as PIXI.Rectangle).width;
        let renderHeight = (this.stage.hitArea as PIXI.Rectangle).height;

        let deltaH = this.credits.height - this.mask.height
        // This is janky but better
        if (deltaH > 0) {
            if (this.paused) {
                this.pauseTime += this.deltaMS
                if (this.pauseTime >= PAUSE_TIME) {
                    this.pauseTime = 0
                    if (this.offset === 0) {
                        this.paused = false
                    } else {
                        this.offset = 0
                    }
                }
            } else {
                this.offset += this.deltaMS * RATE / 1000
                if (this.offset > deltaH) {
                    this.paused = true
                    this.pauseTime = 0
                }
            }

            if (this.offset > deltaH) this.offset = deltaH

            this.credits.position.set((renderWidth - CREDITS_WIDTH) / 2, this.mask.y - this.offset)
        } else {
            this.credits.position.set((renderWidth - CREDITS_WIDTH) / 2, (renderHeight - this.credits.height) / 2)
            this.pauseTime = 0
            this.paused = true
            this.offset = 0
        }
    }
}

class CreditMenu implements GameMenuI {
    gameApp: AppState
    menuState: MenuState
    stage: PIXI.Container
    title: PIXI.Text
    prompt: PIXI.Text
    creditsView: CreditViewPort
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

        this.prompt = new PIXI.Text("Click anywhere to procede...", proceedStyle)
        this.prompt.anchor.set(0.5, 1.0)
        this.stage.addChild(this.prompt)

        this.creditsView = new CreditViewPort(this.stage)

        this.elapsed = 0
    }

    procede() {
        this.gameApp.soundManager.play("select", true)
        this.menuState.setMenu("mainMenu")
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
        this.creditsView.deltaMS = this.gameApp.timing.delta
        this.prompt.alpha = (Math.cos(this.elapsed * 2 * Math.PI / 3000) + 1) / 2
    }

    updateDisplay(renderWidth: number, renderHeight: number) {

        (this.stage.hitArea as PIXI.Rectangle).width = renderWidth;
        (this.stage.hitArea as PIXI.Rectangle).height = renderHeight;

        let width = Math.min(renderWidth, renderHeight * 16 / 9)
        this.prompt.style.wordWrapWidth = width

        this.title.position.set(renderWidth / 2, BIG_MARGIN)
        this.prompt.position.set(renderWidth / 2, renderHeight - BIG_MARGIN)

        let creditsX = (renderWidth - CREDITS_WIDTH) / 2
        let creditsY = BIG_MARGIN + this.title.height + this.title.y
        let creditsW = CREDITS_WIDTH
        let creditsH = renderHeight - (this.title.height + this.prompt.height + 4 * BIG_MARGIN)

        this.creditsView.setMask(creditsX, creditsY, creditsW, creditsH)

        this.creditsView.placeCredits()
    }
}

export {CreditMenu}