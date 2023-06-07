import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

import { PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth } from './physics_objects'
import { Spawner } from './spawner'

function nextLevel(level: number) {
    return Math.round(Math.pow(level * 4, 2))
}

class LevelManager {
    score: number
    level: number
    lastTarget: number
    target: number

    constructor() {
        this.score = 0
        this.level = 1
        this.lastTarget = 0
        this.target = nextLevel(this.level)
    }

    add(score: number) {
        this.score += score

        while(this.score >= this.target) {
            this.level++
            this.lastTarget = this.target
            this.target = nextLevel(this.level)
        }
    }
}

class GameState {
    stage: PIXI.Container
    width: number
    height: number
    engine: Matter.Engine
    world: Matter.World
    spawner: Spawner
    levelState: LevelManager
    walls: Array<BarrierRect | BarrierPoly>
    goals: Array<GoalRect>
    orbs: Array<Orb>
    pegs: Array<Peg>

    constructor(width: number = 1000, height: number = 1000) {
        this.stage = new PIXI.Container()

        this.width = width
        this.height = height

        this.engine = Matter.Engine.create()
        this.world = this.engine.world

        this.walls = []
        this.goals = []
        this.orbs = []
        this.pegs = []

        this.levelState = new LevelManager()

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
        {x: wallWidth / 4, y: 50 + wallWidth / 4},
        {x: 0, y: 50}
    ]

    let leftWall = new BarrierPoly(state.world, 0, 0, ...leftWallVerts)
    leftWall.addTo(state.stage)
    state.walls.push(leftWall)

    let rightWallVerts = [
        {x: 0, y: state.height - 20},
        {x: -wallWidth / 2, y: state.height - 40},
        {x: -wallWidth / 4, y: 50 + wallWidth / 4},
        {x: 0, y: 50}
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
                peg.addTo(state.stage)
                state.pegs.push(peg)
            }
        }
    }

    state.spawner.spawnOrb()
}

export {GameState}
export {initWorld}