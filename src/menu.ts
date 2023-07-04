import * as PIXI from 'pixi.js'

import { AppMode, AppState } from './app'
import { WORLD_LIST, WorldChoice } from './worlds'
import { AppInteraction } from './keyboard'
import { makePromptCard, makeWorldCard, makeWorldSelect } from './cards'

class SelectorBar {
    menu: GameMenu
    bar: PIXI.Container
    prompt: PIXI.Container
    subBar: PIXI.Container
    choices: Array<PIXI.Container>
    selector: PIXI.Graphics

    constructor(menu: GameMenu) {
        this.menu = menu

        this.bar = new PIXI.Container()
        this.menu.stage.addChild(this.bar)

        this.prompt = makePromptCard("Select level")
        this.bar.addChild(this.prompt)

        this.subBar = new PIXI.Container()
        this.subBar.position.set(0, this.bar.height + 15)
        this.bar.addChild(this.subBar)

        for (let world of WORLD_LIST) {
            let choice = makeWorldCard(world.title)
            choice.position.set(0, this.subBar.height)
            this.subBar.addChild(choice)
        }

        this.selector = makeWorldSelect()
        this.selector.position.set(0, 0)
        this.subBar.addChild(this.selector)
    }
}

class GameMenu {
    gameApp: AppState
    stage: PIXI.Container
    bar: SelectorBar
    activeSelection: WorldChoice
    description: PIXI.Graphics

    constructor(gameApp: AppState) {
        this.gameApp = gameApp
        this.stage = new PIXI.Container()
        this.bar = new SelectorBar(this)
        
    }

    parseInput() {
        if (this.gameApp.inputs.poll(AppInteraction.SELECT)) {
            console.log(`Going to game '${this.gameApp.currentWorld.title}'`)
            this.gameApp.replaceWorld()
            this.gameApp.setMode(AppMode.GAME)
        }
    }
}

export {GameMenu}