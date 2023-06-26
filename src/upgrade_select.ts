import * as PIXI from 'pixi.js'

import { COLORS } from './colors'
import { GameState } from './game_state'
import { Upgrade } from './upgrade'
import { makePromptCard } from './cards'

class UpgradeSelect {
    choices: Array<Upgrade>
    box: PIXI.Container
    gameState: GameState
    prompt: PIXI.Container
    constructor(gameState: GameState) {
        this.choices = []
        this.box = new PIXI.Container()
        this.gameState = gameState
        this.prompt = makePromptCard("Select an upgrade!")
    }

    addChoices(...upgrades: Array<Upgrade>) {
        if (this.box.height === 0) {
            this.box.addChild(this.prompt)
            this.prompt.position.set(0, 0)
        }
        for (let upgrade of upgrades) {
            this.choices.push(upgrade)
            upgrade.graphics.position.set(0, 15 + this.box.height)
            this.box.addChild(upgrade.graphics)

            upgrade.graphics.on("pointerdown", (event) => {
                event.stopPropagation()
                this.select(upgrade)
            })
        }
    }

    select(upgrade: Upgrade) {
        upgrade.apply(this.gameState)
        this.clear()
        this.gameState.levelState.check()
    }

    clear() {
        this.box.removeChild(this.prompt)
        
        for (let upgrade of this.choices) {
            this.box.removeChild(upgrade.graphics)
        }

        this.choices.splice(0, this.choices.length)
        this.gameState.setRunning(true)
    }
}

export {UpgradeSelect}