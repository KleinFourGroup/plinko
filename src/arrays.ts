import { GoalRect, Peg, Bouncer } from './physics_objects'
import { GameState } from './game_state'

class PegArray {
    gameState: GameState
    pegs: Array<Peg | Bouncer>
    pegValue: number
    bouncerValue: number
    constructor(gameState: GameState) {
        this.gameState = gameState
        this.pegs = []
        this.pegValue = 1
        this.bouncerValue = 1
    }

    add(peg: Peg | Bouncer) {
        peg.addTo(this.gameState.stage)
        this.pegs.push(peg)
    }

    replace(index: number, newPeg: Peg | Bouncer) {
        let oldPeg = this.pegs[index]
        oldPeg.removeFrom(this.gameState.stage)
        oldPeg.delete()
        newPeg.addTo(this.gameState.stage)
        this.pegs[index] = newPeg
    }

    get pegCount() {
        let pegsArr = this.pegs.filter((peg) => peg instanceof Peg)
        return pegsArr.length
    }

    get bouncerCount() {
        let bouncersArr = this.pegs.filter((peg) => peg instanceof Bouncer)
        return bouncersArr.length
    }
}

class GoalArray {
    gameState: GameState
    goals: Array<GoalRect>
    constructor(gameState: GameState) {
        this.gameState = gameState
        this.goals = []
    }

    add(goal: GoalRect) {
        goal.addTo(this.gameState.stage)
        this.goals.push(goal)
    }

    addFlatScore(amount: number) {
        for (let goal of this.goals) {
            goal.score += amount
        }
    }

    multiplyScore(amount: number) {
        for (let goal of this.goals) {
            goal.score = Math.round(goal.score * amount)
        }
    }

    shuffleScore() {
        let scores = this.goals.map((goal) => goal.score)
        for (let index = scores.length - 1; index > 0; index--) {
            let swap = Math.floor(Math.random() * (index + 1));
            let temp = scores[index]
            scores[index] = scores [swap]
            scores[swap] = temp
        }

        for (let index = 0; index < scores.length; index++) {
            this.goals[index].score = scores[index]
        }
    }
}

export {PegArray, GoalArray}