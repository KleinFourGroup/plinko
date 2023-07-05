import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

import { GameState } from './game_state'
import { labelMap, PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth, Bouncer } from './physics_objects'


type WorldInitializer = (state: GameState) => void

type WorldChoice = {
    init: WorldInitializer,
    title: string,
    description: string
}

function classicWorldInit(state: GameState) {
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

let classicWorld: WorldChoice = {
    init: classicWorldInit,
    title: "Classic",
    description: "A classic plinko board, with a diagonally aligned lattice of pegs over a row of goals."
}

let classicWorld2: WorldChoice = {
    init: classicWorldInit,
    title: "Classic 2",
    description: "A classic plinko board, with a diagonally aligned lattice of pegs over a row of goals."
}

let classicWorld3: WorldChoice = {
    init: classicWorldInit,
    title: "Classic 3",
    description: "A classic plinko board, with a diagonally aligned lattice of pegs over a row of goals."
}

const WORLD_LIST = [
    classicWorld,
    classicWorld2,
    classicWorld3
]

export {WorldInitializer, WorldChoice}
export {WORLD_LIST}