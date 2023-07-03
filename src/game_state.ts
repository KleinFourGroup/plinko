import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

import { getCollisionHandler } from './collision'
import { labelMap, PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth, Bouncer } from './physics_objects'
import { Spawner } from './spawner'
import { ScoreCollision, GameEvent, LevelUp, BouncerCollision, PegCollision, OutOfBounds, GameOver, ContinueGame, RestartEvent, GotoMenuEvent } from './events'
import { UpgradeSelect } from './upgrade_select'
import { TimingManager } from './timing'
import { UpgradeManager } from './upgrade_manager'
import { LevelManager } from './level_manager'
import { PegArray, GoalArray } from './arrays'
import { RestartSelect } from './restart_select'
import { AppMode, AppState } from './app'
import { AppInteraction } from './keyboard'
import { WorldInitializer } from './worlds'

// Helper function for automatically selecting upgrades
function selectRandom(level: number, gameState: GameState) {
    if (gameState.upgradeSelect.choices.length > 0 && gameState.levelState.level === level && gameState.upgradeSelect.isActive) {
        let index = Math.floor(Math.random() * gameState.upgradeSelect.choices.length)
        let choice = gameState.upgradeSelect.choices[index]
        gameState.upgradeSelect.select(choice)
    } else {
        console.error(`Skipping random upgrade selection: choice for level ${level} already made`)
    } 
}

function autoContinue(cc: number, gameState: GameState) {
    if (gameState.continues === cc && gameState.restartSelect.isActive) {
        gameState.restartSelect.continueWorld()
    } else {
        console.error(`Skipping auto continue: choice already made`)
    }
}

type GameConfig = {
    autoControl: boolean,
    checkInput: boolean
    countBalls: boolean,
    trackProgress: boolean,
    width: number,
    height: number
}

const PLAY_CONFIG: GameConfig = {
    autoControl: false,
    checkInput: true,
    countBalls: true,
    trackProgress: true,
    width: 1000,
    height: 1000
}

const PREVIEW_CONFIG: GameConfig = {
    autoControl: true,
    checkInput: false,
    countBalls: false,
    trackProgress: false,
    width: 1000,
    height: 1000
}

// Main class for holding the game's state
class GameState {
    gameApp: AppState
    config: GameConfig
    initializer: WorldInitializer
    stage: PIXI.Container
    running: boolean
    spawn: boolean
    continues: number
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
    restartSelect: RestartSelect

    constructor(gameApp: AppState, config: Partial<GameConfig> = {}) {
        this.gameApp = gameApp

        this.config = {...PLAY_CONFIG, ...config}
        
        this.initializer = null

        this.stage = new PIXI.Container()
        this.upgradeSelect = null
        this.restartSelect = null

        this.timing = null

        this.continues = 0

        this.engine = Matter.Engine.create()
        this.world = this.engine.world

        let collisionHandler = getCollisionHandler(labelMap, this)
        Matter.Events.on(this.engine, "collisionStart", collisionHandler)

        this.walls = []
        this.orbs = []

        this.eventQueue = []
        this.running = true
        this.spawn = false

        this.levelState = new LevelManager(this)
        this.spawner = new Spawner(this)
        this.pegArray = new PegArray(this)
        this.goalArray = new GoalArray(this)
        this.upgradeManager = new UpgradeManager(this)
    }

    destroy() {
        if (this.upgradeSelect.isActive) this.upgradeSelect.clear()
        if (this.restartSelect.isActive) this.restartSelect.deactivate()
        
        for (let wall of this.walls) {
            wall.removeFrom(this.stage)
            wall.delete()
        }
        this.walls.splice(0, this.walls.length)

        for (let goal of this.goalArray.goals) {
            goal.removeFrom(this.stage)
            goal.delete()
        }
        this.goalArray.goals.splice(0, this.goalArray.goals.length)

        for (let peg of this.pegArray.pegs) {
            peg.removeFrom(this.stage)
            peg.delete()
        }
        this.pegArray.pegs.splice(0, this.pegArray.pegs.length)

        for (let orb of this.orbs) {
            orb.removeFrom(this.stage)
            orb.delete()
        }
        this.orbs.splice(0, this.orbs.length)
    }

    get width() {
        return this.config.width
    }

    get height() {
        return this.config.height
    }

    set width(width: number) {
        this.config.width = width
    }

    set height(height: number) {
        this.config.height = height
    }

    parseInput() {
        if (this.gameApp.inputs.poll(AppInteraction.SPAWN) && this.config.checkInput) {
            this.spawn = true
        }

        if (this.gameApp.inputs.poll(AppInteraction.RESTART) && this.config.checkInput) {
            this.enqueueEvent(new RestartEvent())
        }

        if (this.gameApp.inputs.poll(AppInteraction.MENU) && this.config.checkInput) {
            this.enqueueEvent(new GotoMenuEvent())
        }
    }

    setRunning(shouldRun: boolean) {
        // console.log(`Game is now ${shouldRun ? "running" : "paused"}`)
        this.running = shouldRun
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
                    if (this.config.trackProgress) this.levelState.add(score.goal.score)
                    break
                case "peghit":
                    let peg = (event as PegCollision)
                    if (this.config.trackProgress) this.levelState.add(this.pegArray.pegValue)
                    break
                case "bouncerhit":
                    let bounce = (event as BouncerCollision)
                    let dirX = bounce.orb.body.position.x - bounce.bouncer.body.position.x
                    let dirY = bounce.orb.body.position.y - bounce.bouncer.body.position.y
                    let dist = Math.hypot(dirX, dirY)
                    let oldVelX = bounce.orb.body.velocity.x
                    let oldVelY = bounce.orb.body.velocity.y
                    Matter.Body.setVelocity(bounce.orb.body, {x: oldVelX + 10 * dirX /dist, y: oldVelY + 10 * dirY / dist})
                    if (this.config.trackProgress) this.levelState.add(this.pegArray.bouncerValue)
                    // console.log(Math.hypot(bounce.orb.body.velocity.x, bounce.orb.body.velocity.y))
                    break
                case "levelup":
                    console.assert(this.config.trackProgress)
                    let levelup = (event as LevelUp)
                    if (levelup.level === 1 + this.levelState.level) {
                        this.levelState.levelUp()
                        this.spawner.ballsUsed = 0
                        this.spawner.addSpeed(1)
                        this.upgradeManager.generate()
                        this.setRunning(false)
                        if (this.config.autoControl) this.timing.createTimer("autopick", 5000, (state: GameState) => {
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
                case "gameover":
                    console.assert(this.config.countBalls && this.config.trackProgress)
                    console.log("Game over!")
                    this.restartSelect.activate()
                    this.setRunning(false)
                    let cc = this.continues
                    if (this.config.autoControl) this.timing.createTimer("continue", 5000, (state: GameState) => {
                        autoContinue(cc, state)
                    })
                    break
                case "continue":
                    console.log("Continuing...")
                    let continueGame = (event as ContinueGame)
                    if (continueGame.cc === 1 + this.continues) {
                        this.spawner.ballsUsed = 0
                        this.continues++
                        this.setRunning(true)
                    } else {
                        console.error(`ContinueGame mismatch - expected ${this.continues + 1}; got ${continueGame.cc}`)
                    }
                    break
                case "restart":
                    console.log("Restarting...")
                    this.destroy()
                    this.gameApp.replaceWorld()
                    return
                    break
                case "menu":
                    console.log("Going to menu...")
                    this.destroy()
                    this.gameApp.setMode(AppMode.MENU)
                    return
                    break
                default:
                    console.error("Unknown event type: " + event.typeStr)
            }
        }
    }

    checkGameOver() {
        if (this.running && this.config.countBalls && this.config.trackProgress) {
            let noBalls = (this.spawner.balls === this.spawner.ballsUsed) && (this.orbs.length ===0)
            let noEvents = (this.eventQueue.length === 0)
            let noPending = (this.upgradeSelect.choices.length == 0)
            if (noBalls && noEvents && noPending) {
                this.enqueueEvent(new GameOver())
            }
        }
    }

    updateFrame(deltaMS: number) {
        this.timing.runTimers(this)

        if (this.running) this.spawner.update(this.timing.delta)
    
        if (this.config.autoControl || this.spawn) {
            this.spawn = false
            if (this.running && this.orbs.length == 0) {
                this.spawner.spawnOrb(!this.config.countBalls || !this.config.trackProgress)
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

export {GameState}