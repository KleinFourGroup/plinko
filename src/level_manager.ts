import { LevelUp } from "./events"
import { GameState } from "./game_state"


function nextLevel(level: number) {
    return Math.round(Math.pow(level, 2) * 250)
}

class LevelManager {
    gameState: GameState
    score: number
    level: number
    lastTarget: number
    target: number

    constructor(gameState: GameState) {
        this.gameState = gameState
        this.score = 0
        this.level = 1
        this.lastTarget = 0
        this.target = nextLevel(this.level)
    }

    add(score: number) {
        let oldScore = this.score
        this.score += score

        if (this.score >= this.target && oldScore < this.target) {
            this.gameState.enqueueEvent(new LevelUp(this.level + 1))
        }
    }

    check() {
        if (this.score >= this.target) {
            this.gameState.enqueueEvent(new LevelUp(this.level + 1))
        }
    }

    levelUp() {
        this.level++
        this.lastTarget = this.target
        this.target = nextLevel(this.level)
    }
}

export {LevelManager}