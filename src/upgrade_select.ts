import * as PIXI from 'pixi.js'

import { COLORS } from './colors'
import { GameState } from './game_state'
import { Upgrade } from './upgrade'

class UpgradeSelect {
    choices: Array<Upgrade>
    box: PIXI.Container
    gameState: GameState
    constructor(gameState: GameState) {
        this.choices = []
        this.box = new PIXI.Container()
        this.gameState = gameState
    }

    addChoices(...upgrades: Array<Upgrade>) {
        for (let upgrade of upgrades) {
            this.choices.push(upgrade)
            let height = this.box.height
            this.box.addChild(upgrade.graphics)
            upgrade.graphics.position.set(0, (height !== 0 ? 15 : 0) + height)

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
        for (let upgrade of this.choices) {
            this.box.removeChild(upgrade.graphics)
        }

        this.choices.splice(0, this.choices.length)
        this.gameState.setRunning(true)
    }
}

export {UpgradeSelect}