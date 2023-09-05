import * as PIXI from 'pixi.js'

import { AppMode, AppState } from '../app'
import { makeSimpleCard } from '../cards'
import { SelectorCallback, SelectorBase } from './select'
import { MainMenu } from '../menus/main_menu'

class SelectorMainMenu extends SelectorBase {
    menu: MainMenu
    box: PIXI.Container
    playGraphics: PIXI.Container
    helpGraphics: PIXI.Container
    resetGraphics: PIXI.Container
    creditsGraphics: PIXI.Container

    constructor(menu: MainMenu) {
        let choices: Array<PIXI.Container> = []
        let onSelects: Array<SelectorCallback> = []
        let onHighlights: Array<SelectorCallback> = []

        let playGraphics = makeSimpleCard("Select Level")
        let playSelect = (gameApp: AppState) => {
            this.menu.menuState.setMenu("levelSelect")
        }
        choices.push(playGraphics)
        onSelects.push(playSelect)
        onHighlights.push(null)

        let helpGraphics = makeSimpleCard("Controls")
        let helpSelect = (gameApp: AppState) => {
            this.menu.menuState.setMenu("levelSelect")
        }
        choices.push(helpGraphics)
        onSelects.push(helpSelect)
        onHighlights.push(null)

        let resetGraphics = makeSimpleCard("Reset Progress")
        let resetSelect = (gameApp: AppState) => {
            this.menu.menuState.setMenu("levelSelect")
        }
        choices.push(resetGraphics)
        onSelects.push(resetSelect)
        onHighlights.push(null)

        let creditsGraphics = makeSimpleCard("Credits")
        let creditsSelect = (gameApp: AppState) => {
            this.menu.menuState.setMenu("levelSelect")
        }
        choices.push(creditsGraphics)
        onSelects.push(creditsSelect)
        onHighlights.push(null)

        super(menu.gameApp, choices, onSelects, onHighlights)

        this.menu = menu

        this.box = new PIXI.Container()
        this.menu.stage.addChild(this.box)

        this.playGraphics = playGraphics
        this.playGraphics.position.set(0, 0)
        this.box.addChild(this.playGraphics)

        this.helpGraphics = helpGraphics
        this.helpGraphics.position.set(0, 15 + this.playGraphics.y + this.playGraphics.height)
        this.box.addChild(this.helpGraphics)

        this.resetGraphics = resetGraphics
        this.resetGraphics.position.set(0, 15 + this.helpGraphics.y + this.helpGraphics.height)
        this.box.addChild(this.resetGraphics)

        this.creditsGraphics = creditsGraphics
        this.creditsGraphics.position.set(0, 15 + this.resetGraphics.y + this.resetGraphics.height)
        this.box.addChild(this.creditsGraphics)
        
        this.box.addChild(this.selector)

        this.highlight(this.choices[0], false)
    }
}

export {SelectorMainMenu}