import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

import { getCollisionHandler } from './collision'
import { labelMap, PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth, Bouncer } from './physics_objects'
import { Spawner } from './spawner'
import { ScoreCollision, GameEvent, LevelUp, BouncerCollision, PegCollision, OutOfBounds } from './events'
import { UpgradeSelect } from './upgrade_select'
import { TimingManager } from './timing'
import { UpgradeManager } from './upgrade_manager'
import { LevelManager } from './level_manager'
import { PegArray, GoalArray } from './arrays'

// Helper function for automatically selecting upgrades
function selectRandom(level: number, gameState: GameState) {
    if (gameState.upgradeSelect.choices.length > 0 && gameState.levelState.level === level) {
        let index = Math.floor(Math.random() * gameState.upgradeSelect.choices.length)
        let choice = gameState.upgradeSelect.choices[index]
        gameState.upgradeSelect.select(choice)
    } else {
        console.error(`Skipping random upgrade selection: choice for level ${level} already made`)
    }
}

// Main class for holding the game's state
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
    orbs: Array<Orb>
    pegArray: PegArray
    goalArray: GoalArray
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

        let collisionHandler = getCollisionHandler(labelMap, this)
        Matter.Events.on(this.engine, "collisionStart", collisionHandler)

        this.walls = []
        this.orbs = []

        this.eventQueue = []
        this.running = true
        this.spawn = false
        this.autoControl = autoControl

        this.levelState = new LevelManager(this)
        this.spawner = new Spawner(this)
        this.pegArray = new PegArray(this)
        this.goalArray = new GoalArray(this)
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
                    this.levelState.add(this.pegArray.pegValue)
                    break
                case "bouncerhit":
                    let bounce = (event as BouncerCollision)
                    let dirX = bounce.orb.body.position.x - bounce.bouncer.body.position.x
                    let dirY = bounce.orb.body.position.y - bounce.bouncer.body.position.y
                    let dist = Math.hypot(dirX, dirY)
                    let oldVelX = bounce.orb.body.velocity.x
                    let oldVelY = bounce.orb.body.velocity.y
                    Matter.Body.setVelocity(bounce.orb.body, {x: oldVelX + 10 * dirX /dist, y: oldVelY + 10 * dirY / dist})
                    this.levelState.add(this.pegArray.bouncerValue)
                    // console.log(Math.hypot(bounce.orb.body.velocity.x, bounce.orb.body.velocity.y))
                    break
                case "levelup":
                    let levelup = (event as LevelUp)
                    if (levelup.level === 1 + this.levelState.level) {
                        this.levelState.levelUp()
                        this.spawner.ballsUsed = 0
                        this.spawner.addSpeed(1)
                        this.upgradeManager.generate()
                        this.running = false
                        if (this.autoControl) this.timing.createTimer("autopick", 5000, (state: GameState) => {
                            selectRandom(levelup.level, state)
                        })
                    } else {
                        // Not really an error; add and check can double-fire a level
                        console.error(`LevelUp mismatch - expected ${this.levelState.level + 1}; got ${levelup.level}`)
                    }
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
        for (let goal of this.goalArray.goals) {
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

type WorldInitializer = (state: GameState) => void

function initWorld(state: GameState) {
    let rows = 10
    let cols = 15
    let bins = 7
    let wallWidth = 40
    let toothMinHeight = wallWidth * 3 / 4
    let toothMaxHeight = wallWidth * 3 / 2

    let goalWidth = (state.width - (bins + 1) * wallWidth) / bins

    let tooth = new Tooth(state.world, wallWidth / 2, state.height, wallWidth, toothMinHeight, toothMaxHeight)
    tooth.addTo(state.stage)
    state.walls.push(tooth)

    for (let binNum = 0; binNum < bins; binNum++) {
        let off = wallWidth + binNum * (wallWidth + goalWidth)
        let tooth = new Tooth(state.world, off + goalWidth + wallWidth / 2, state.height, wallWidth, toothMinHeight, toothMaxHeight)
        tooth.addTo(state.stage)
        state.walls.push(tooth)
    }

    for (let binNum = 0; binNum < bins; binNum++) {
        let off = wallWidth + binNum * (wallWidth + goalWidth)
        let goal = new GoalRect(state.world, off + goalWidth / 2, state.height - toothMinHeight / 2, goalWidth, toothMinHeight, 50 + 50 * Math.abs(binNum - (bins - 1) / 2))
        state.goalArray.add(goal)
    }

    let leftWallVerts = [
        {x: 0, y: state.height - toothMinHeight},
        {x: wallWidth / 2, y: state.height - toothMaxHeight},
        {x: wallWidth / 4, y: wallWidth / 4},
        {x: 0, y: 0}
    ]

    let leftWall = new BarrierPoly(state.world, 0, 0, ...leftWallVerts)
    leftWall.addTo(state.stage)
    state.walls.push(leftWall)

    let rightWallVerts = [
        {x: 0, y: state.height - toothMinHeight},
        {x: -wallWidth / 2, y: state.height - toothMaxHeight},
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

export {GameState, WorldInitializer}
export {initWorld}