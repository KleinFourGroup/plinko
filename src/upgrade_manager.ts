
import { GameState } from "./game_state"
import { Bouncer, Peg } from "./physics_objects"
import { Upgrade } from "./upgrade"


function addBouncers(times: number, gameState: GameState) {
    for (let ctr = 0; ctr < times; ctr++) {
        let pegs = gameState.pegArray.pegs.filter((peg: Peg | Bouncer) => (peg instanceof Peg))
        if (pegs.length > 0) {
            let pegsIndex = Math.floor(Math.random() * pegs.length)
            let oldPeg = pegs[pegsIndex]
            let index = gameState.pegArray.pegs.indexOf(oldPeg)
            let bouncer = new Bouncer(gameState.world, oldPeg.body.position.x, oldPeg.body.position.y, 10)
            gameState.pegArray.replace(index, bouncer)
        } else {
            console.error("No pegs to replace!")
        }
    }
}

function dropSpeed(amount: number, gameState: GameState) {
    gameState.spawner.addSpeed(-amount)
}

function getUpgradeLevel(ratio: number, levels: number) {
    let seed = Math.random()
    for (let level = 1; level <= levels; levels++) {
        if (seed < ratio) {
            return level
        }
        else {
            seed = (seed - ratio) / (1 - ratio)
        }
    }

    return levels
}

class UpgradeManager {
    gameState: GameState
    constructor(gameState: GameState) {
        this.gameState = gameState
    }

    generate() {
        let times = 1 + getUpgradeLevel(2 / 3, 3)
        let bouncerUpgrade = new Upgrade(
            `Bouncers +${times}`,
            `Replace ${times} pegs with bouncers`,
            (state: GameState) => {addBouncers(times, state)}
        )
        let slow = getUpgradeLevel(0.8, 3)
        let speedUpgrade = new Upgrade(
            `Speed -${slow}`,
            `Decrease the spawner's speed by ${slow}`,
            (state: GameState) => {dropSpeed(slow, state)}
        )
        this.gameState.upgradeSelect.addChoices(bouncerUpgrade, speedUpgrade)
    }
}

export {UpgradeManager}