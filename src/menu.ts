import * as PIXI from 'pixi.js'

import { AppMode, AppState } from './app'
import { WORLD_LIST, WorldChoice } from './worlds'
import { AppInteraction } from './keyboard'
import { makePromptCard, makeWorldCard, drawWorldSelect } from './cards'

type SelectorCallback = (app: AppState) => void

class SelectorBar {
    menu: GameMenu
    bar: PIXI.Container
    prompt: PIXI.Container
    subBar: PIXI.Container
    choices: Array<PIXI.Container>
    activeChoice: PIXI.Container
    onSelect: Array<SelectorCallback>
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
        this.onSelect = []

        for (let world of WORLD_LIST) {
            let choice = makeWorldCard(world.title)
            choice.position.set(0, this.subBar.height)
            this.subBar.addChild(choice)
            this.choices.push(choice)

            choice.on("pointerenter", (event) => {
                event.stopPropagation()
                this.highlight(choice)
            })
            choice.on("pointerdown", (event) => {
                event.stopPropagation()
                // Might be redundant
                this.highlight(choice)
                this.select()
            })

            this.onSelect.push((gameApp: AppState) => {
                gameApp.currentWorld = world
                console.log(`Going to game '${gameApp.currentWorld.title}'`)
                gameApp.replaceWorld()
                gameApp.setMode(AppMode.GAME)
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

    select() {
        let index = this.choices.indexOf(this.activeChoice)
        let selectCallback = this.onSelect[index];
        selectCallback(this.menu.gameApp)
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
            this.bar.select()
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