import * as PIXI from 'pixi.js'

import { COLORS } from '../colors'
import { GameState } from '../game_state'
import { Upgrade } from '../upgrade'
import { makePromptCard } from '../cards'
import { SelectorBase } from './select'
import { AppState } from '../app'

class UpgradeSelect extends SelectorBase {
    box: PIXI.Container
    gameState: GameState
    prompt: PIXI.Container
    constructor(gameState: GameState) {
        super(gameState.gameApp, [], [], [])
        this.box = new PIXI.Container()
        this.gameState = gameState
        this.prompt = makePromptCard("Select an upgrade!")
    }

    get isActive() {
        return this.box.height !== 0
    }

    addChoices(...upgrades: Array<Upgrade>) {
        if (this.box.height === 0) {
            this.box.addChild(this.prompt)
            this.prompt.position.set(0, 0)
        }

        for (let upgrade of upgrades) {
            this.choices.push(upgrade.graphics as PIXI.Container)

            upgrade.graphics.position.set(0, 15 + this.box.height)
            this.box.addChild(upgrade.graphics)

            this.onSelects.push((gameApp: AppState) => {
                upgrade.apply(this.gameState)
                this.clear()
                this.gameState.levelState.check()
            })
            this.onHighlights.push(null)

            upgrade.graphics.on("pointerenter", (event) => {
                event.stopPropagation()
                this.highlight(upgrade.graphics as PIXI.Container)
            })
            upgrade.graphics.on("pointerdown", (event) => {
                event.stopPropagation()
                // Might be redundant
                this.highlight(upgrade.graphics as PIXI.Container)
                this.select()
            })
        }

        if (this.box.children.indexOf(this.selector) < 0) this.box.addChild(this.selector)
        this.highlight(this.choices[0])
    }

    clear() {
        this.box.removeChild(this.prompt)
        this.box.removeChild(this.selector)
        
        for (let card of this.choices) {
            this.box.removeChild(card)
        }

        this.choices.splice(0, this.choices.length)
        this.onSelects.splice(0, this.onSelects.length)
        this.onHighlights.splice(0, this.onHighlights.length)

        this.gameState.setRunning(true)
    }
}

export {UpgradeSelect}