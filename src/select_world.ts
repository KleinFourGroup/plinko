import * as PIXI from 'pixi.js'

import { AppMode, AppState } from './app'
import { WORLD_LIST, WorldChoice } from './worlds'
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
            onHighlights.push(null)
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

// class SelectorBar {
//     menu: GameMenu
//     box: PIXI.Container
//     prompt: PIXI.Container
//     subBar: PIXI.Container
//     choices: Array<PIXI.Container>
//     activeChoice: PIXI.Container
//     onSelect: Array<SelectorCallback>
//     selector: PIXI.Graphics

//     constructor(menu: GameMenu) {
//         this.menu = menu

//         this.box = new PIXI.Container()
//         this.menu.stage.addChild(this.box)

//         this.prompt = makePromptCard("Select level")
//         this.prompt.position.set(0, 15)
//         this.box.addChild(this.prompt)

//         this.subBar = new PIXI.Container()
//         this.subBar.position.set(0, this.prompt.y + this.prompt.height + 15)
//         this.box.addChild(this.subBar)

//         this.choices = []
//         this.onSelect = []

//         for (let world of WORLD_LIST) {
//             let choice = makeWorldCard(world.title)
//             choice.position.set(0, this.subBar.height)
//             this.subBar.addChild(choice)
//             this.choices.push(choice)

//             choice.on("pointerenter", (event) => {
//                 event.stopPropagation()
//                 this.highlight(choice)
//             })
//             choice.on("pointerdown", (event) => {
//                 event.stopPropagation()
//                 // Might be redundant
//                 this.highlight(choice)
//                 this.select()
//             })

//             this.onSelect.push((gameApp: AppState) => {
//                 gameApp.currentWorld = world
//                 console.log(`Going to game '${gameApp.currentWorld.title}'`)
//                 gameApp.replaceWorld()
//                 gameApp.setMode(AppMode.GAME)
//             })
//         }

//         this.selector = new PIXI.Graphics()
//         this.subBar.addChild(this.selector)

//         this.highlight(this.choices[0])
//     }

//     highlight(choice: PIXI.Container) {
//         console.assert(this.choices.indexOf(choice) >= 0)
//         this.activeChoice = choice
//         drawWorldSelect(this.selector, choice.x, choice.y, choice.width, choice.height)
//     }

//     moveUp() {
//         let index = this.choices.indexOf(this.activeChoice)
//         index = Math.max(index - 1, 0)
//         this.highlight(this.choices[index])
//     }

//     moveDown() {
//         let index = this.choices.indexOf(this.activeChoice)
//         index = Math.min(index + 1, this.choices.length - 1)
//         this.highlight(this.choices[index])
//     }

//     select() {
//         let index = this.choices.indexOf(this.activeChoice)
//         let selectCallback = this.onSelect[index];
//         selectCallback(this.menu.gameApp)
//     }
// }

export {SelectorBar}