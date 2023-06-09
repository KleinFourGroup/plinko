import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

import { PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth, Bouncer } from './physics_objects'
import { Spawner } from './spawner'
import { ScoreCollision, GameEvent, LevelUp, BouncerCollision } from './events'
import { Upgrade } from './upgrade'
import { UserInterface } from './ui'

function nextLevel(level: number) {
    return Math.round(Math.pow(level * 4, 1.75))
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

class PegArray {
    gameState: GameState
    pegs: Array<Peg | Bouncer>
    constructor(gameState: GameState) {
        this.gameState = gameState
        this.pegs = []
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
}

class GameState {
    stage: PIXI.Container
    width: number
    height: number
    engine: Matter.Engine
    world: Matter.World
    eventQueue: Array<GameEvent>
    spawner: Spawner
    levelState: LevelManager
    walls: Array<BarrierRect | BarrierPoly>
    goals: Array<GoalRect>
    orbs: Array<Orb>
    pegArray: PegArray
    ui: UserInterface

    constructor(width: number = 1000, height: number = 1000) {
        this.stage = new PIXI.Container()
        this.ui = null

        this.width = width
        this.height = height

        this.engine = Matter.Engine.create()
        this.world = this.engine.world

        this.walls = []
        this.goals = []
        this.orbs = []

        this.eventQueue = []

        this.levelState = new LevelManager(this)
        this.spawner = new Spawner(this)
        this.pegArray = new PegArray(this)
    }

    enqueueEvent(event: GameEvent) {
        this.eventQueue.push(event)
    }

    parseEvents() {
        while (this.eventQueue.length > 0) {
            let event = this.eventQueue[0]
            this.eventQueue.splice(0, 1)
            switch (event.typeStr) {
                case "score":
                    let score = (event as ScoreCollision)
                    score.orb.removeFrom(this.stage)
                    score.orb.delete()
                    this.orbs.splice(this.orbs.indexOf(score.orb), 1)
                    this.levelState.add(score.goal.score)
                    break
                case "bouncer":
                    let bounce = (event as BouncerCollision)
                    let dirX = bounce.orb.body.position.x - bounce.bouncer.body.position.x
                    let dirY = bounce.orb.body.position.y - bounce.bouncer.body.position.y
                    let dist = Math.hypot(dirX, dirY)
                    let oldVelX = bounce.orb.body.velocity.x
                    let oldVelY = bounce.orb.body.velocity.y
                    Matter.Body.setVelocity(bounce.orb.body, {x: oldVelX + 10 * dirX /dist, y: oldVelY + 10 * dirY / dist})
                    console.log(Math.hypot(bounce.orb.body.velocity.x, bounce.orb.body.velocity.y))
                    break
                case "levelup":
                    let levelup = (event as LevelUp)
                    this.levelState.levelUp()
                    this.levelState.check()
                    let index = Math.floor(Math.random() * this.pegArray.pegs.length)
                    let oldPeg = this.pegArray.pegs[index]
                    let bouncer = new Bouncer(this.world, oldPeg.body.position.x, oldPeg.body.position.y, 10)
                    this.pegArray.replace(index, bouncer)
                    let upgrade = new Upgrade("Test", "Testing...")
                    this.ui.upgradeSelect.addChoices(upgrade)
                    break
                default:
                    console.error("Unknown event type: " + event.typeStr)
            }
        }
    }
    
    updateGraphics() {
        for (let wall of this.walls) {
            wall.update()
        }
        for (let goal of this.goals) {
            goal.update()
        }
        for (let peg of this.pegArray.pegs) {
            peg.update()
        }
        for (let orb of this.orbs) {
            orb.update()
        }
    }
}

function initWorld(state: GameState) {
    let rows = 10
    let cols = 17
    let bins = 8
    let wallWidth = 30

    let goalWidth = (state.width - (bins + 1) * wallWidth) / bins

    let tooth = new Tooth(state.world, wallWidth / 2, state.height, wallWidth, 20, 40)
    tooth.addTo(state.stage)
    state.walls.push(tooth)

    for (let binNum = 0; binNum < bins; binNum++) {
        let off = wallWidth + binNum * (wallWidth + goalWidth)
        let goal = new GoalRect(state.world, off + goalWidth / 2, state.height - 10, goalWidth, 20, 2 * Math.abs(binNum - (bins - 1) / 2))
        goal.addTo(state.stage)
        state.goals.push(goal)
        
        let tooth = new Tooth(state.world, off + goalWidth + wallWidth / 2, state.height, wallWidth, 20, 40)
        tooth.addTo(state.stage)
        state.walls.push(tooth)
    }

    let leftWallVerts = [
        {x: 0, y: state.height - 20},
        {x: wallWidth / 2, y: state.height - 40},
        {x: wallWidth / 4, y: wallWidth / 4},
        {x: 0, y: 0}
    ]

    let leftWall = new BarrierPoly(state.world, 0, 0, ...leftWallVerts)
    leftWall.addTo(state.stage)
    state.walls.push(leftWall)

    let rightWallVerts = [
        {x: 0, y: state.height - 20},
        {x: -wallWidth / 2, y: state.height - 40},
        {x: -wallWidth / 4, y: wallWidth / 4},
        {x: 0, y: 0}
    ]

    let rightWall = new BarrierPoly(state.world, state.width, 0, ...rightWallVerts)
    rightWall.addTo(state.stage)
    state.walls.push(rightWall)

    let pegWidth = (state.width - 2 * wallWidth) * 0.9  - 10

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (col % 2 == row % 2) {
                let x = (state.width - pegWidth) / 2 + (pegWidth / (cols - 1)) * col
                let y = state.height - 100 - 50 * row
                let peg = new Peg(state.world, x, y, 5)
                state.pegArray.add(peg)
            }
        }
    }

    state.spawner.spawnOrb()
}

export {GameState}
export {initWorld}