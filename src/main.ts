import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

import { COLORS } from './colors'
import { DisplayState, UserInterface } from './ui'
import { Point, labelMap, PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth } from './physics_objects'

// Create the application helper and add its render target to the page
let app = new PIXI.Application({ resizeTo: window, background: COLORS["terminal black"], antialias: true });

// @ts-ignore
document.body.appendChild(app.view);

class Spawner {
    state: GameState
    time: number
    spawnBase: Point
    spawnPoint: Point
    spawnDot: PIXI.Graphics

    constructor(gameState: GameState) {
        this.state = gameState
        this.time = 0.0
        this.spawnBase = {
            x: this.state.width / 2,
            y: 100
        }
        this.spawnPoint = {
            x: this.state.width / 2,
            y: 100
        }

        this.spawnDot = new PIXI.Graphics()
        this.spawnDot.beginFill(COLORS["terminal green"])
        this.spawnDot.drawCircle(0, 0, 5)
        this.spawnDot.endFill()

        this.spawnDot.position.set(this.spawnPoint.x, this.spawnPoint.y)
        this.state.stage.addChild(this.spawnDot)
    }

    spawnOrb() {
        let newOrb = new Orb(world,  this.spawnPoint.x + (2 * Math.random() - 1), this.spawnPoint.y, 15)
        newOrb.addTo(this.state.stage)
        this.state.orbs.push(newOrb)
    }

    update(delta: number, progress: number) {

        let off = Math.abs(Math.sin(this.time)) * (1 + 1.5 * progress)
    
        this.time += (0.1 + 0.9 * off * off) * 3 * delta / 1000
    
        this.spawnPoint.x = this.state.width / 2 + Math.sin(this.time) * (this.state.width - 50) / 2

        this.spawnDot.position.set(this.spawnPoint.x, this.spawnPoint.y)
    }
}

class GameState {
    stage: PIXI.Container
    width: number
    height: number
    score: number
    spawner: Spawner
    walls: Array<BarrierRect | BarrierPoly>
    goals: Array<GoalRect>
    orbs: Array<Orb>
    pegs: Array<Peg>
    target: number

    constructor(gameStage: PIXI.Container, width: number = 1000, height: number = 1000) {
        this.stage = gameStage

        this.width = width
        this.height = height

        this.walls = []
        this.goals = []
        this.orbs = []
        this.pegs = []

        this.score = 0
        this.target = 500

        this.spawner = new Spawner(this)
    }
    
    updateGraphics() {
        for (let wall of this.walls) {
            wall.update()
        }
        for (let goal of this.goals) {
            goal.update()
        }
        for (let peg of this.pegs) {
            peg.update()
        }
        for (let orb of this.orbs) {
            orb.update()
        }
    }
}

let display = new DisplayState(app)
let gameState = new GameState(display.gameStage)
let ui = new UserInterface(display.uiStage)

let spawn = false

let engine = Matter.Engine.create()
let world = engine.world

function initWorld(state: GameState) {
    let rows = 10
    let cols = 17
    let bins = 8
    let wallWidth = 30

    let goalWidth = (state.width - (bins + 1) * wallWidth) / bins

    let tooth = new Tooth(world, wallWidth / 2, state.height, wallWidth, 20, 40)
    tooth.addTo(state.stage)
    state.walls.push(tooth)

    for (let binNum = 0; binNum < bins; binNum++) {
        let off = wallWidth + binNum * (wallWidth + goalWidth)
        let goal = new GoalRect(world, off + goalWidth / 2, state.height - 10, goalWidth, 20, 2 * Math.abs(binNum - (bins - 1) / 2))
        goal.addTo(state.stage)
        state.goals.push(goal)
        
        let tooth = new Tooth(world, off + goalWidth + wallWidth / 2, state.height, wallWidth, 20, 40)
        tooth.addTo(state.stage)
        state.walls.push(tooth)
    }

    let leftWallVerts = [
        {x: 0, y: state.height - 20},
        {x: wallWidth / 2, y: state.height - 40},
        {x: wallWidth / 4, y: 50 + wallWidth / 4},
        {x: 0, y: 50}
    ]

    let leftWall = new BarrierPoly(world, 0, 0, ...leftWallVerts)
    leftWall.addTo(state.stage)
    state.walls.push(leftWall)

    let rightWallVerts = [
        {x: 0, y: state.height - 20},
        {x: -wallWidth / 2, y: state.height - 40},
        {x: -wallWidth / 4, y: 50 + wallWidth / 4},
        {x: 0, y: 50}
    ]

    let rightWall = new BarrierPoly(world, state.width, 0, ...rightWallVerts)
    rightWall.addTo(state.stage)
    state.walls.push(rightWall)

    let pegWidth = (state.width - 2 * wallWidth) * 0.9  - 10

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (col % 2 == row % 2) {
                let x = (state.width - pegWidth) / 2 + (pegWidth / (cols - 1)) * col
                let y = state.height - 100 - 50 * row
                let peg = new Peg(world, x, y, 5)
                peg.addTo(state.stage)
                state.pegs.push(peg)
            }
        }
    }

    state.spawner.spawnOrb()
}

initWorld(gameState)

function collisionDispatch(event: Matter.IEventCollision<Matter.Engine>) {
    for (let pair of event.pairs) {
        let objA = labelMap.get(pair.bodyA.label)
        let objB = labelMap.get(pair.bodyB.label)
        if (objA instanceof GoalRect) {
            if (objB instanceof Orb) {
                objB.removeFrom(gameState.stage)
                labelMap.delete(pair.bodyB.label)
                objB.delete()
                gameState.orbs.splice(gameState.orbs.indexOf(objB), 1)
                gameState.score += objA.score
            }
        }
        if (objB instanceof GoalRect) {
            if (objA instanceof Orb) {
                objA.removeFrom(gameState.stage)
                labelMap.delete(pair.bodyA.label)
                objA.delete()
                gameState.orbs.splice(gameState.orbs.indexOf(objA), 1)
                gameState.score += objB.score
            }
        }
    }
}

Matter.Events.on(engine, "collisionStart", collisionDispatch)

let intervalsTotal: Array<number> = []
let intervalsWork: Array<number> = []

let lastWork = 0

// Add a ticker callback to move the sprite back and forth
let lastStep = 0
let lastTick = 0
let elapsed = 0.0;

let spawnTot = 0.0

// delta is in frames, not ms =()
function update(delta: number) {
    let deltaMS: number = app.ticker.deltaMS

    intervalsTotal.push(deltaMS)
    intervalsWork.push(lastWork)

    if (intervalsTotal.length > 20) {
        intervalsTotal.shift()
        intervalsWork.shift()
    }

    let load = intervalsWork.reduce((a, b) => a + b, 0) / intervalsTotal.reduce((a, b) => a + b, 0)
    
    elapsed += deltaMS;

    let startWork = performance.now()

    let progress = Math.min(gameState.score / gameState.target, 1)

    gameState.spawner.update(deltaMS, progress)

    if (elapsed - lastStep >= 20) {
        lastStep = Math.floor(elapsed)
        Matter.Engine.update(engine, 20)
    }

    // if (spawn) {
    if (elapsed - lastTick >= 1000 || spawn) {
        spawn = false
        lastTick = Math.floor(elapsed)
        if (gameState.orbs.length < 15) {
            gameState.spawner.spawnOrb()
        }
    }

    gameState.updateGraphics()
    ui.update(app.ticker.FPS, load, gameState.score, gameState.target)
    display.update()
    
    let endWork = performance.now()

    lastWork = endWork - startWork
}

addEventListener("click", (event) => {spawn = true})
addEventListener("pointerdown", (event) => {spawn = true})
addEventListener("keydown", (event) => {spawn = true})

app.ticker.add(update);