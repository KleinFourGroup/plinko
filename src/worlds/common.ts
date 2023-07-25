import { GameState } from '../game_state'
import { labelMap, PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth, Bouncer } from '../physics_objects'
import { WorldChoice } from './worlds'

type binValsFn = (binInd: number, binCount: number) => number

const outBins: binValsFn = (binInd: number, binCount: number) => {
    return 50 + 50 * Math.abs(binInd - (binCount - 1) / 2)
}

const inBins: binValsFn = (binInd: number, binCount: number) => {
    return 50 * (binCount + 1) / 2 - 50 * Math.abs(binInd - (binCount - 1) / 2)
}

function baseWorldInit(state: GameState, bins: number, binVals: binValsFn) {
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
        let goal = new GoalRect(state.world, off + goalWidth / 2, state.height - toothMinHeight / 2, goalWidth, toothMinHeight, binVals(binNum, bins))
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

    return wallWidth
}

export {inBins, outBins}
export {baseWorldInit}