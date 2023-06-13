import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

import { PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth, Bouncer } from './physics_objects'
import { Spawner } from './spawner'
import { ScoreCollision, GameEvent, LevelUp, BouncerCollision, PegCollision, OutOfBounds } from './events'
import { Upgrade } from './upgrade'
import { UserInterface } from './ui'
import { UpgradeSelect } from './upgrade_select'
import { TimingManager } from './timing'
import { UpgradeManager } from './upgrade_manager'

function nextLevel(level: number) {
    return Math.round(Math.pow(level * 11.1, 1.625))
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

// TODO: Rework for back-to-back level ups
function selectRandom(gameState: GameState) {
    if (gameState.upgradeSelect.choices.length > 0) {
        let index = Math.floor(Math.random() * gameState.upgradeSelect.choices.length)
        let choice = gameState.upgradeSelect.choices[index]
        gameState.upgradeSelect.select(choice)
    }
}

class GameState {
    stage: PIXI.Container
    width: number
    height: number
    running: boolean
    spawn: boolean
    autoControl: boolean
    timing: TimingManager
    engine: Matter.Engine
    world: Matter.World
    eventQueue: Array<GameEvent>
    spawner: Spawner
    levelState: LevelManager
    walls: Array<BarrierRect | BarrierPoly>
    goals: Array<GoalRect>
    orbs: Array<Orb>
    pegArray: PegArray
    upgradeManager: UpgradeManager
    upgradeSelect: UpgradeSelect

    constructor(width: number = 1000, height: number = 1000, autoControl: boolean = false) {
        this.stage = new PIXI.Container()
        this.upgradeSelect = null

        this.width = width
        this.height = height

        this.timing = null

        this.engine = Matter.Engine.create()
        this.world = this.engine.world

        this.walls = []
        this.goals = []
        this.orbs = []

        this.eventQueue = []
        this.running = true
        this.spawn = false
        this.autoControl = autoControl

        this.levelState = new LevelManager(this)
        this.spawner = new Spawner(this)
        this.pegArray = new PegArray(this)
        this.upgradeManager = new UpgradeManager(this)
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
                case "peghit":
                    let peg = (event as PegCollision)
                    this.levelState.add(1)
                    break
                case "bouncerhit":
                    let bounce = (event as BouncerCollision)
                    let dirX = bounce.orb.body.position.x - bounce.bouncer.body.position.x
                    let dirY = bounce.orb.body.position.y - bounce.bouncer.body.position.y
                    let dist = Math.hypot(dirX, dirY)
                    let oldVelX = bounce.orb.body.velocity.x
                    let oldVelY = bounce.orb.body.velocity.y
                    Matter.Body.setVelocity(bounce.orb.body, {x: oldVelX + 10 * dirX /dist, y: oldVelY + 10 * dirY / dist})
                    this.levelState.add(1)
                    // console.log(Math.hypot(bounce.orb.body.velocity.x, bounce.orb.body.velocity.y))
                    break
                case "levelup":
                    let levelup = (event as LevelUp)
                    this.levelState.levelUp()
                    this.levelState.check()
                    this.spawner.addSpeed(1)
                    this.upgradeManager.generate()
                    this.running = false
                    if (this.autoControl) this.timing.createTimer("autopick", 3000, selectRandom)
                    break
                case "outofbounds":
                    let bounds = (event as OutOfBounds)
                    bounds.orb.removeFrom(this.stage)
                    bounds.orb.delete()
                    this.orbs.splice(this.orbs.indexOf(bounds.orb), 1)
                    console.error("Orb went out of bounds")
                    break
                default:
                    console.error("Unknown event type: " + event.typeStr)
            }
        }
    }

    updateFrame(deltaMS: number) {
        this.timing.runTimers(this)

        if (this.running) this.spawner.update(this.timing.delta)
    
        if (this.autoControl || this.spawn) {
            this.spawn = false
            if (this.running && this.orbs.length == 0) {
                this.spawner.spawnOrb()
            }
        }
    }

    updateStep() {
        if (this.running) {
            Matter.Engine.update(this.engine, 16.67)
            
            for (let orb of this.orbs) {
                if (orb.body.position.x < -10 || orb.body.position.x > this.width + 10 || orb.body.position.y < -10 || orb.body.position.y > this.height + 10) {
                    let bounds = new OutOfBounds(orb)
                    this.enqueueEvent(bounds)
                }
            }
        }
        return this.running
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
    let cols = 15
    let bins = 7
    let wallWidth = 40

    let goalWidth = (state.width - (bins + 1) * wallWidth) / bins

    let tooth = new Tooth(state.world, wallWidth / 2, state.height, wallWidth, wallWidth * 3 / 4, wallWidth * 3 /2)
    tooth.addTo(state.stage)
    state.walls.push(tooth)

    for (let binNum = 0; binNum < bins; binNum++) {
        let off = wallWidth + binNum * (wallWidth + goalWidth)
        let goal = new GoalRect(state.world, off + goalWidth / 2, state.height - 10, goalWidth, wallWidth * 3 / 4, 10 + 10 * Math.abs(binNum - (bins - 1) / 2))
        goal.addTo(state.stage)
        state.goals.push(goal)
        
        let tooth = new Tooth(state.world, off + goalWidth + wallWidth / 2, state.height, wallWidth, wallWidth * 3 / 4, wallWidth * 3 /2)
        tooth.addTo(state.stage)
        state.walls.push(tooth)
    }

    let leftWallVerts = [
        {x: 0, y: state.height - wallWidth * 3 / 4},
        {x: wallWidth / 2, y: state.height - wallWidth * 3 / 2},
        {x: wallWidth / 4, y: wallWidth / 4},
        {x: 0, y: 0}
    ]

    let leftWall = new BarrierPoly(state.world, 0, 0, ...leftWallVerts)
    leftWall.addTo(state.stage)
    state.walls.push(leftWall)

    let rightWallVerts = [
        {x: 0, y: state.height - wallWidth * 3 / 4},
        {x: -wallWidth / 2, y: state.height - wallWidth * 3 / 2},
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
                let y = state.height - wallWidth * 3 / 2 - 60 - (pegWidth / (cols - 1)) * row
                let peg = new Peg(state.world, x, y, 5)
                state.pegArray.add(peg)
            }
        }
    }
}

export {GameState}
export {initWorld}