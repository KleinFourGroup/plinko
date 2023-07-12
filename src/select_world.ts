import * as PIXI from 'pixi.js'

import { AppMode, AppState } from './app'
import { WORLD_LIST, WorldChoice } from './worlds/worlds'
import { makePromptCard, makeWorldCard, drawWorldSelect } from './cards'
import { GameMenu } from './menu'
import { SelectorCallback, SelectorBase } from './select'

class SelectorBar extends SelectorBase {
    menu: GameMenu
    box: PIXI.Container
    prompt: PIXI.Container
    subBar: PIXI.Container

    constructor(menu: GameMenu) {
        let choices: Array<PIXI.Container> = []
        let onSelects: Array<SelectorCallback> = []
        let onHighlights: Array<SelectorCallback> = []

        for (let world of WORLD_LIST) {
            let choice = makeWorldCard(world.title)
            choices.push(choice)
            onSelects.push((gameApp: AppState) => {
                gameApp.currentWorld = world
                console.log(`Going to game '${gameApp.currentWorld.title}'`)
                gameApp.replaceWorld()
                gameApp.setMode(AppMode.GAME)
            })
            onHighlights.push((gameApp: AppState) => {
                this.menu.activeSelection = world
            })
        }

        super(menu.gameApp, choices, onSelects, onHighlights)

        this.menu = menu

        this.box = new PIXI.Container()
        this.menu.stage.addChild(this.box)

        this.prompt = makePromptCard("Select level")
        this.prompt.position.set(0, 15)
        this.box.addChild(this.prompt)

        this.subBar = new PIXI.Container()
        this.subBar.position.set(0, this.prompt.y + this.prompt.height + 15)
        this.box.addChild(this.subBar)

        for (let choice of this.choices) {
            choice.position.set(0, this.subBar.height)
            this.subBar.addChild(choice)
        }

        this.subBar.addChild(this.selector)

        this.highlight(this.choices[0])
    }
}

export {SelectorBar}