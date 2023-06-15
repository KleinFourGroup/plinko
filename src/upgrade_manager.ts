import { GameState } from "./game_state"
import { UpgradeSignature, Upgrade } from "./upgrade"

import { UPGRADE_LIST } from "./upgrades"

class UpgradeManager {
    gameState: GameState
    options: number
    constructor(gameState: GameState) {
        this.gameState = gameState
        this.options = 3
    }

    generate() {
        let upgrades: Array<Upgrade> = []
        let upgradeList = [...UPGRADE_LIST]
        while (upgrades.length < this.options && upgradeList.length > 0) {
            let totalWeight = upgradeList.map<number>(
                (upgrade: UpgradeSignature) => upgrade.weight
            ).reduce((a, b) => a + b, 0)
            let weightedIndex = Math.random() * totalWeight

            let realIndex = 0
            while (upgradeList[realIndex].weight < weightedIndex && realIndex < upgradeList.length) {
                weightedIndex -= upgradeList[realIndex].weight
                realIndex++
            }
            if (realIndex === upgradeList.length) {
                console.error("Bad index")
                realIndex = upgradeList.length -1
            }

            let upgradeGenerator = upgradeList[realIndex]
            upgradeList.splice(realIndex, 1)

            let magnitude = upgradeGenerator.magnitude(this.gameState)
            let title = upgradeGenerator.title(magnitude, this.gameState)
            let description = upgradeGenerator.description(magnitude, this.gameState)
            let effect = upgradeGenerator.effect(magnitude, this.gameState)
            let upgrade = new Upgrade(title, description, effect)
            upgrades.push(upgrade)
        }
        this.gameState.upgradeSelect.addChoices(...upgrades)
    }
}

export {UpgradeManager}