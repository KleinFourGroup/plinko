import * as PIXI from 'pixi.js'

import { AppState } from './app'
import { WorldChoice } from './worlds/worlds'
import { SelectorBar } from './select_world'
import { COLORS } from './colors'
import { MARGIN } from './cards'

const worldDescStyle = new PIXI.TextStyle({
    wordWrap: true,
    fontFamily: "monospace",
    fill: COLORS["terminal amber"]
})

class WorldDescription {
    menu: GameMenu
    box: PIXI.Container
    background: PIXI.Graphics
    text: PIXI.Text
    width: number
    height: number

    constructor(menu: GameMenu) {
        this.menu = menu
        this.box = new PIXI.Container()
        this.menu.stage.addChild(this.box)

        this.background = new PIXI.Graphics()
        this.box.addChild(this.background)

        this.text = new PIXI.Text("?", worldDescStyle)
        this.text.position.set(MARGIN, MARGIN)
        this.box.addChild(this.text)
        
        this.width = null
        this.height = null
    }

    update(x: number, y: number, width: number) {
        if (this.width !== width) this.text.style.wordWrapWidth = width - 2 * MARGIN

        this.text.text = this.menu.activeSelection.description

        if (this.width !== width || this.height !== this.text.height + 2 * MARGIN) {
            this.width = width
            this.height = this.text.height + 2 * MARGIN
            
            this.background.clear()
            this.background.lineStyle(3, COLORS["terminal amber"])
            this.background.beginFill(COLORS["dark terminal amber"])
            this.background.drawRect(0, 0, this.width, this.height)
            this.background.endFill()
        }

        this.box.position.set(x, y - this.height - MARGIN)
    }
}

class GameMenu {
    gameApp: AppState
    stage: PIXI.Container
    bar: SelectorBar
    activeSelection: WorldChoice
    description: WorldDescription

    constructor(gameApp: AppState) {
        this.gameApp = gameApp
        this.stage = new PIXI.Container()
        this.activeSelection = null
        this.bar = new SelectorBar(this)
        this.description = new WorldDescription(this)
    }

    parseInput() {
        this.bar.parseInput()
    }
}

export {GameMenu}