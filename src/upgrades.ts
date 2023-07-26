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

let bouncerCreateUpgrade: UpgradeSignature = {
    weight: 15,
    magnitude: (state: GameState) => {
        return 2 + getUpgradeLevel(2 / 3, 3)
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

let speedIncUpgrade: UpgradeSignature = {
    weight: 5,
    magnitude: (state: GameState) => {
        return 1 + getUpgradeLevel(2 / 3, 3)
    },
    title: (magnitude: number, state: GameState) => {
        return `Speed +${magnitude}`
    },
    description: (magnitude: number, state: GameState) => {
        return `Increase the spawner's speed by ${magnitude}`
    },
    effect: (magnitude: number, state: GameState) => {
        return (state: GameState) => {
            state.spawner.addSpeed(magnitude)
        }
    }
}

let speedDecUpgrade: UpgradeSignature = {
    weight: 5,
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
            state.spawner.addSpeed(-magnitude)
        }
    }
}

let accuracyIncUpgrade: UpgradeSignature = {
    weight: 5,
    magnitude: (state: GameState) => {
        return 10 * getUpgradeLevel(2 / 3, 3)
    },
    title: (magnitude: number, state: GameState) => {
        return `Accuracy +${magnitude}%`
    },
    description: (magnitude: number, state: GameState) => {
        return `Increase the spawner's accuracy by ${magnitude}%`
    },
    effect: (magnitude: number, state: GameState) => {
        return (state: GameState) => {
            state.spawner.addAccuracy(magnitude)
        }
    }
}

let accuracyDecUpgrade: UpgradeSignature = {
    weight: 5,
    magnitude: (state: GameState) => {
        return 10 * getUpgradeLevel(2 / 3, 3)
    },
    title: (magnitude: number, state: GameState) => {
        return `Accuracy -${magnitude}%`
    },
    description: (magnitude: number, state: GameState) => {
        return `Decrease the spawner's accuracy by ${magnitude}%`
    },
    effect: (magnitude: number, state: GameState) => {
        return (state: GameState) => {
            state.spawner.addAccuracy(-magnitude)
        }
    }
}

let pegValueUpgrade: UpgradeSignature = {
    weight: 7.5,
    magnitude: (state: GameState) => {
        return 1 + 2 * getUpgradeLevel(2 / 3, 3)
    },
    title: (magnitude: number, state: GameState) => {
        return `Peg value +${magnitude}`
    },
    description: (magnitude: number, state: GameState) => {
        return `Increase the value of hitting a peg by ${magnitude}`
    },
    effect: (magnitude: number, state: GameState) => {
        return (state: GameState) => {
            state.pegArray.pegValue += magnitude
        }
    }
}

let bouncerValueUpgrade: UpgradeSignature = {
    weight: 7.5,
    magnitude: (state: GameState) => {
        return 1 + 2 * getUpgradeLevel(2 / 3, 3)
    },
    title: (magnitude: number, state: GameState) => {
        return `Bouncer value +${magnitude}`
    },
    description: (magnitude: number, state: GameState) => {
        return `Increase the value of hitting a bouncer by ${magnitude}`
    },
    effect: (magnitude: number, state: GameState) => {
        return (state: GameState) => {
            state.pegArray.bouncerValue += magnitude
        }
    }
}

let goalAddUpgrade: UpgradeSignature = {
    weight: 2.5,
    magnitude: (state: GameState) => {
        return 50 * getUpgradeLevel(2 / 3, 3)
    },
    title: (magnitude: number, state: GameState) => {
        return `Goal value +${magnitude}`
    },
    description: (magnitude: number, state: GameState) => {
        return `Increase the value of hitting a goal by ${magnitude}`
    },
    effect: (magnitude: number, state: GameState) => {
        return (state: GameState) => {
            state.goalArray.addFlatScore(magnitude)
        }
    }
}

let goalMultiplyUpgrade: UpgradeSignature = {
    weight: 2.5,
    magnitude: (state: GameState) => {
        return 5 * getUpgradeLevel(2 / 3, 3)
    },
    title: (magnitude: number, state: GameState) => {
        return `Goal value +${magnitude}%`
    },
    description: (magnitude: number, state: GameState) => {
        return `Increase the value of hitting a goal by ${magnitude}%`
    },
    effect: (magnitude: number, state: GameState) => {
        return (state: GameState) => {
            state.goalArray.multiplyScore(1 + magnitude / 100)
        }
    }
}

let goalShuffleUpgrade: UpgradeSignature = {
    weight: 2.5,
    magnitude: (state: GameState) => {
        return 1
    },
    title: (magnitude: number, state: GameState) => {
        return `Shuffle goals`
    },
    description: (magnitude: number, state: GameState) => {
        return `Randomly rearrange the values of the goals`
    },
    effect: (magnitude: number, state: GameState) => {
        return (state: GameState) => {
            state.goalArray.shuffleScore()
        }
    }
}

let multiDropUpgrade: UpgradeSignature = {
    weight: 1,
    magnitude: (state: GameState) => {
        return getUpgradeLevel(4 / 5, 2)
    },
    title: (magnitude: number, state: GameState) => {
        return `Drop count +${magnitude}`
    },
    description: (magnitude: number, state: GameState) => {
        return `Increase the number of balls dropped per spawn by ${magnitude}%`
    },
    effect: (magnitude: number, state: GameState) => {
        return (state: GameState) => {
            state.spawner.dropCount += magnitude
        }
    }
}

let freePointsUpgrade: UpgradeSignature = {
    weight: 1,
    magnitude: (state: GameState) => {
        return 1
    },
    title: (magnitude: number, state: GameState) => {
        return `Free points!`
    },
    description: (magnitude: number, state: GameState) => {
        return `Adds 2500 points to your score`
    },
    effect: (magnitude: number, state: GameState) => {
        return (state: GameState) => {
            state.levelState.add(2500)
        }
    }
}

let ballExtraUpgrade: UpgradeSignature = {
    weight: 5,
    magnitude: (state: GameState) => {
        return 4 + getUpgradeLevel(2 / 3, 6)
    },
    title: (magnitude: number, state: GameState) => {
        return `Balls +${magnitude}`
    },
    description: (magnitude: number, state: GameState) => {
        return `Adds ${magnitude} balls to your arsenal`
    },
    effect: (magnitude: number, state: GameState) => {
        return (state: GameState) => {
            state.spawner.balls += magnitude
        }
    }
}

const UPGRADE_LIST = [
    bouncerCreateUpgrade,
    speedIncUpgrade,
    speedDecUpgrade,
    accuracyIncUpgrade,
    accuracyDecUpgrade,
    pegValueUpgrade,
    bouncerValueUpgrade,
    goalAddUpgrade,
    goalMultiplyUpgrade,
    goalShuffleUpgrade,
    multiDropUpgrade,
    freePointsUpgrade,
    ballExtraUpgrade
]

export {UPGRADE_LIST}