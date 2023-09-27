import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'
import {Howl, Howler} from 'howler'

import { getCollisionHandler } from './collision'
import { labelMap, PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth, Bouncer, HiddenBoundary } from './physics_objects'
import { Spawner } from './spawner'
import { ScoreCollision, GameEvent, LevelUp, BouncerCollision, PegCollision, OutOfBounds, GameOver, ContinueGame, RestartEvent, GotoMenuEvent, OrbCollision, MiscCollision, EndlessEvent } from './events'
import { UpgradeSelect } from './selector/select_upgrade'
import { TimingManager } from './timing'
import { UpgradeManager } from './upgrade_manager'
import { LevelManager } from './level_manager'
import { PegArray, GoalArray } from './arrays'
import { RestartSelect } from './selector/select_restart'
import { AppMode, AppState } from './app'
import { WorldInitializer } from './worlds/worlds'
import { FXStage, ScoreFX } from './effects'
import { WinSelect } from './selector/select_win'

// Helper function for automatically selecting upgrades
function selectRandom(level: number, gameState: GameState) {
    if (gameState.upgradeSelect.choices.length > 0 && gameState.levelState.level === level && gameState.upgradeSelect.isActive) {
        let index = Math.floor(Math.random() * gameState.upgradeSelect.choices.length)
        let choice = gameState.upgradeSelect.choices[index]
        gameState.upgradeSelect.highlight(choice, false)
        gameState.upgradeSelect.select()
    } else {
        console.error(`Skipping random upgrade selection: choice for level ${level} already made`)
    } 
}

function autoContinue(cc: number, gameState: GameState) {
    if (gameState.continues === cc && gameState.restartSelect.isActive) {
        gameState.gameApp.soundManager.play("select", true)
        gameState.restartSelect.continueWorld()
    } else {
        console.error(`Skipping auto continue: choice already made`)
    }
}

function autoEndless(level: number, gameState: GameState) {
    if (gameState.levelState.level === level && gameState.winSelect.isActive) {
        gameState.gameApp.soundManager.play("select", true)
        gameState.winSelect.continueWorld()
    } else {
        console.error(`Skipping auto endless: choice already made`)
    }
}

type GameConfig = {
    autoControl: boolean,
    checkInput: boolean
    countBalls: boolean,
    trackProgress: boolean,
    playSound: boolean,
    width: number,
    height: number,
    levels: number
}

const PLAY_CONFIG: GameConfig = {
    autoControl: false,
    checkInput: true,
    countBalls: true,
    trackProgress: true,
    playSound: true,
    width: 1000,
    height: 1000,
    levels: 999 // Should never appear
}

const PREVIEW_CONFIG: GameConfig = {
    autoControl: true,
    checkInput: false,
    countBalls: false,
    trackProgress: false,
    playSound: false,
    width: 1000,
    height: 1000,
    levels: 999 // Should never appear
}

// Main class for holding the game's state
class GameState {
    gameApp: AppState
    config: GameConfig
    initializer: WorldInitializer
    id: string
    box: PIXI.Container
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
    walls: Array<BarrierRect | BarrierPoly | HiddenBoundary>
    orbs: Array<Orb>
    pegArray: PegArray
    goalArray: GoalArray
    upgradeManager: UpgradeManager
    upgradeSelect: UpgradeSelect
    restartSelect: RestartSelect
    winSelect: WinSelect
    vfx: FXStage

    constructor(gameApp: AppState, config: Partial<GameConfig> = {}) {
        this.gameApp = gameApp

        this.config = {...PLAY_CONFIG, ...config}
        
        this.initializer = null
        this.id = ""

        this.box = new PIXI.Container()

        this.stage = new PIXI.Container()
        this.box.addChild(this.stage)

        this.upgradeSelect = null
        this.restartSelect = null
        this.winSelect = null

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

        this.vfx = new FXStage(this)
    }

    destroy() {
        if (this.upgradeSelect.isActive) this.upgradeSelect.clear()
        if (this.restartSelect.isActive) this.restartSelect.deactivate()
        if (this.winSelect.isActive) this.winSelect.deactivate()
        
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

        this.vfx.destroy()
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
        if (this.upgradeSelect.isActive) this.upgradeSelect.parseInput()
        if (this.restartSelect.isActive) this.restartSelect.parseInput()
        if (this.winSelect.isActive) this.winSelect.parseInput()

        if (this.gameApp.inputs.poll("SPAWN") && this.config.checkInput) {
            this.spawn = true
        }

        if (this.gameApp.inputs.poll("RESTART") && this.config.checkInput) {
            this.enqueueEvent(new RestartEvent())
        }

        if (this.gameApp.inputs.poll("MENU") && this.config.checkInput) {
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
                    this.gameApp.soundManager.play("score", this.config.playSound)
                    score.orb.removeFrom(this.stage)
                    this.orbs.splice(this.orbs.indexOf(score.orb), 1)
                    if (this.config.trackProgress) {
                        this.levelState.add(score.goal.score)
                        this.spawner.addScore(score.goal.score)
                        this.vfx.register(new ScoreFX(`${this.spawner.dropScore}`, score.orb.x, score.orb.y))
                    }
                    score.orb.delete()
                    break
                case "peghit":
                    let peg = (event as PegCollision)
                    this.gameApp.soundManager.play("peghit", this.config.playSound)
                    if (this.config.trackProgress) {
                        this.levelState.add(this.pegArray.pegValue)
                        this.spawner.addScore(this.pegArray.pegValue)
                        this.vfx.register(new ScoreFX(`${this.spawner.dropScore}`, peg.orb.x, peg.orb.y))
                    }
                    break
                case "bouncerhit":
                    let bounce = (event as BouncerCollision)
                    this.gameApp.soundManager.play("bouncerhit", this.config.playSound)
                    let dirX = bounce.orb.body.position.x - bounce.bouncer.body.position.x
                    let dirY = bounce.orb.body.position.y - bounce.bouncer.body.position.y
                    let dist = Math.hypot(dirX, dirY)
                    let oldVelX = bounce.orb.body.velocity.x
                    let oldVelY = bounce.orb.body.velocity.y
                    Matter.Body.setVelocity(bounce.orb.body, {x: oldVelX + 10 * dirX /dist, y: oldVelY + 10 * dirY / dist})
                    if (this.config.trackProgress) {
                        this.levelState.add(this.pegArray.bouncerValue)
                        this.spawner.addScore(this.pegArray.bouncerValue)
                        this.vfx.register(new ScoreFX(`${this.spawner.dropScore}`, bounce.orb.x, bounce.orb.y))
                    }
                    // console.log(Math.hypot(bounce.orb.body.velocity.x, bounce.orb.body.velocity.y))
                    break
                case "orbhit":
                    let orbs = (event as OrbCollision)
                    this.gameApp.soundManager.play("mischit", this.config.playSound)
                    break
                case "mischit":
                    let misc = (event as MiscCollision)
                    this.gameApp.soundManager.play("mischit", this.config.playSound)
                    break
                case "levelup":
                    console.assert(this.config.trackProgress)
                    let levelup = (event as LevelUp)
                    if (levelup.level === 1 + this.levelState.level) {
                        this.gameApp.soundManager.play("levelup", true)
                        this.updateHighScore()
                        this.levelState.levelUp()
                        this.spawner.ballsUsed = 0
                        // this.spawner.addSpeed(1)
                        this.spawner.addBalls(3)
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
                    this.gameApp.soundManager.play("error", this.config.playSound)
                    bounds.orb.removeFrom(this.stage)
                    bounds.orb.delete()
                    this.orbs.splice(this.orbs.indexOf(bounds.orb), 1)
                    console.error("Orb went out of bounds")
                    break
                case "gamewin":
                    console.log("Game won!")
                    this.gameApp.soundManager.play("gamewin", true)
                    this.winSelect.activate()
                    this.setRunning(false)
                    this.updateHighScore()
                    let endLevel = this.levelState.level
                    if (this.config.autoControl) this.timing.createTimer("endless", 5000, (state: GameState) => {
                        autoEndless(endLevel, state)
                    })
                    break
                case "endless":
                    console.log("Endless mode...")
                    let endless = (event as EndlessEvent)
                    if (!this.levelState.endless && this.levelState.level == endless.level) {
                        this.levelState.endless = true
                        this.setRunning(true)
                        this.levelState.check()
                    } else {
                        console.error("EndlessEvent mismatch - already in endless mode or level mismatch")
                    }
                    break
                case "gameover":
                    console.assert(this.config.countBalls && this.config.trackProgress)
                    console.log("Game over!")
                    this.gameApp.soundManager.play("gameover", true)
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
                    this.gameApp.soundManager.play("select", true)
                    this.destroy()
                    this.gameApp.setMode(AppMode.MENU)
                    return
                    break
                default:
                    console.error("Unknown event type: " + event.typeStr)
            }
        }
    }

    updateHighScore(onlyCC: boolean = true) {
        if (!onlyCC || this.continues === 0) {
            this.gameApp.progressTracker.addHighScore(this.id, this.levelState.level)
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

        this.vfx.update(this.timing.delta)
    }

    updateStep(steps: number, STEP: number) {
        if (this.running) this.spawner.update(steps * STEP)
    
        if (this.config.autoControl || this.spawn) {
            this.spawn = false
            if (this.running && this.orbs.length == 0) {
                this.spawner.spawnOrb(!this.config.countBalls || !this.config.trackProgress)
            }
        }

        if (this.running) {
            this.pegArray.update(steps * STEP)

            Matter.Engine.update(this.engine, steps * STEP)
            
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
export {PREVIEW_CONFIG}
export {GameState}