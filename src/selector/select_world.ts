import * as PIXI from 'pixi.js'

import { AppMode, AppState } from '../app'
import { WORLD_LIST, WorldChoice, getLevelData } from '../worlds/worlds'
import { makePromptCard, makeWorldCard, drawWorldSelect } from '../cards'
import { LevelSelectMenu } from '../menus/level_menu'
import { SelectorCallback, SelectorBase } from './select'

class SelectorBar extends SelectorBase {
    menu: LevelSelectMenu
    box: PIXI.Container
    prompt: PIXI.Container
    subBar: PIXI.Container

    constructor(menu: LevelSelectMenu) {
        let choices: Array<PIXI.Container> = []
        let onSelects: Array<SelectorCallback> = []
        let onHighlights: Array<SelectorCallback> = []

        super(menu.gameApp, choices, onSelects, onHighlights)

        this.menu = menu

        this.box = new PIXI.Container()
        this.menu.selectStage.addChild(this.box)

        this.prompt = makePromptCard("Select level")
        this.prompt.position.set(0, 15)
        this.box.addChild(this.prompt)

        this.subBar = new PIXI.Container()
        this.subBar.position.set(0, this.prompt.y + this.prompt.height + 15)
        this.box.addChild(this.subBar)
        
        this.loadWorlds(false)
    }

    loadWorlds(refresh: boolean = true) {
        if (refresh) {
            for (let choice of this.choices) {
                this.subBar.removeChild(choice)
            }
    
            this.subBar.removeChild(this.selector)
    
            this.choices.splice(0, this.choices.length)
            this.invalidChoices.splice(0, this.invalidChoices.length)
            this.onSelects.splice(0, this.onSelects.length)
            this.onHighlights.splice(0, this.onHighlights.length)
        }

        let progress = this.menu.gameApp.progressTracker

        console.log("Loading available worlds...")

        for (let [world, unlocked] of progress.getWorlds()) {
            let lockString = (unlocked) ? "" : "[LOCKED] "
            let choice = makeWorldCard(lockString + getLevelData(world.id, "title"))
            this.choices.push(choice)

            if (!unlocked) this.invalidChoices.push(choice)

            this.onSelects.push((gameApp: AppState) => {
                gameApp.currentWorld = world
                console.log(`Going to game '${getLevelData(gameApp.currentWorld.id, "title")}'`)
                gameApp.replaceWorld()
                gameApp.setMode(AppMode.GAME)
            })
            this.onHighlights.push((gameApp: AppState) => {
                this.menu.activeSelection = world
            })

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
        }

        for (let choice of this.choices) {
            choice.position.set(0, this.subBar.height)
            this.subBar.addChild(choice)
        }

        this.subBar.addChild(this.selector)

        this.highlight(this.choices[0], false)
    }
}

export {SelectorBar}