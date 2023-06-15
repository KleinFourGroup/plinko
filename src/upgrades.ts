import { GameState } from "./game_state"
import { Bouncer, Peg } from "./physics_objects"
import { UpgradeSignature } from "./upgrade"

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

let bouncerUpgrade: UpgradeSignature = {
    weight: 1,
    magnitude: (state: GameState) => {
        return 1 + getUpgradeLevel(2 / 3, 3)
    },
    title: (magnitude: number, state: GameState) => {
        return `Bouncers +${magnitude}`
    },
    description: (magnitude: number, state: GameState) => {
        return `Replace ${magnitude} pegs with bouncers`
    },
    effect: (magnitude: number, state: GameState) => {
        return (state: GameState) => {
            addBouncers(magnitude, state)
        }
    }
}

let speedUpgrade: UpgradeSignature = {
    weight: 1,
    magnitude: (state: GameState) => {
        return 1 + getUpgradeLevel(2 / 3, 3)
    },
    title: (magnitude: number, state: GameState) => {
        return `Speed -${magnitude}`
    },
    description: (magnitude: number, state: GameState) => {
        return `Decrease the spawner's speed by ${magnitude}`
    },
    effect: (magnitude: number, state: GameState) => {
        return (state: GameState) => {
            dropSpeed(magnitude, state)
        }
    }
}

const UPGRADE_LIST = [
    bouncerUpgrade,
    speedUpgrade
]

export {UPGRADE_LIST}