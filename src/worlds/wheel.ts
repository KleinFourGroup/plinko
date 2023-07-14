import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

import { GameState } from '../game_state'
import { labelMap, PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth, Bouncer } from '../physics_objects'
import { WorldChoice } from './worlds'
import { ParametricFn, TimedPath } from '../point'

function wheelWorldInit(state: GameState) {
    let numPegs = 16
    let period = 3000
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
    let pegHeight = (state.height - wallWidth * 3 / 2 - 60) - 200
    let radius = Math.min(pegWidth, pegHeight) / 2
    let pegX = state.width / 2
    let pegY = 200 + pegHeight / 2

    let orbit: ParametricFn = (time: number) => {
        let x = pegX + radius * Math.sin(time *  2 * Math.PI / period)
        let y = pegY - radius * Math.cos(time *  2 * Math.PI / period)
        return {x: x, y: y}
    }

    for (let num = 0; num < numPegs; num++) {
        let startTime = num * period / numPegs
        let path = new TimedPath(orbit)
        let peg = new Peg(state.world, pegX, pegY, 5)
        state.pegArray.add(peg, path, startTime)
    }
}

let wheelWorld: WorldChoice = {
    init: wheelWorldInit,
    title: "Ferris Wheel",
    description: "A ferris wheel of pegs rotating over a row of goals."
}

export {wheelWorld}