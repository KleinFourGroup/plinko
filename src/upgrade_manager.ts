
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

class UpgradeManager {
    gameState: GameState
    constructor(gameState: GameState) {
        this.gameState = gameState
    }

    generate() {
        let rand = Math.floor(Math.random() * 9)
        let times = (rand < 6) ? 1 : ((rand < 8) ? 2 : 3)
        let bouncerUpgrade = new Upgrade(
            `Bouncers +${times}`,
            `Replace ${times} pegs with bouncers`,
            (state: GameState) => {addBouncers(times, state)}
        )
        this.gameState.upgradeSelect.addChoices(bouncerUpgrade)
    }
}

export {UpgradeManager}