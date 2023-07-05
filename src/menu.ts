import * as PIXI from 'pixi.js'

import { AppMode, AppState } from './app'
import { WORLD_LIST, WorldChoice } from './worlds'
import { AppInteraction } from './keyboard'
import { makePromptCard, makeWorldCard, drawWorldSelect } from './cards'

class SelectorBar {
    menu: GameMenu
    bar: PIXI.Container
    prompt: PIXI.Container
    subBar: PIXI.Container
    choices: Array<PIXI.Container>
    activeChoice: PIXI.Container
    selector: PIXI.Graphics

    constructor(menu: GameMenu) {
        this.menu = menu

        this.bar = new PIXI.Container()
        this.menu.stage.addChild(this.bar)

        this.prompt = makePromptCard("Select level")
        this.prompt.position.set(0, 15)
        this.bar.addChild(this.prompt)

        this.subBar = new PIXI.Container()
        this.subBar.position.set(0, this.prompt.y + this.prompt.height + 15)
        this.bar.addChild(this.subBar)

        this.choices = []

        for (let world of WORLD_LIST) {
            let choice = makeWorldCard(world.title)
            choice.position.set(0, this.subBar.height)
            this.subBar.addChild(choice)
            this.choices.push(choice)

            choice.on("pointerenter", (event) => {
                event.stopPropagation()
                this.highlight(choice)
            })
        }

        this.selector = new PIXI.Graphics()
        this.subBar.addChild(this.selector)

        this.highlight(this.choices[0])
    }

    highlight(choice: PIXI.Container) {
        console.assert(this.choices.indexOf(choice) >= 0)
        this.activeChoice = choice
        drawWorldSelect(this.selector, choice.x, choice.y, choice.width, choice.height)
    }

    moveUp() {
        let index = this.choices.indexOf(this.activeChoice)
        index = Math.max(index - 1, 0)
        this.highlight(this.choices[index])
    }

    moveDown() {
        let index = this.choices.indexOf(this.activeChoice)
        index = Math.min(index + 1, this.choices.length - 1)
        this.highlight(this.choices[index])
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

        if (this.gameApp.inputs.poll(AppInteraction.UP)) {
            this.bar.moveUp()
        }

        if (this.gameApp.inputs.poll(AppInteraction.DOWN)) {
            this.bar.moveDown()
        }
    }
}

export {GameMenu}