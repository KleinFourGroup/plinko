import { GameState } from '../game_state'
import { labelMap, PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth, Bouncer, HiddenBoundary } from '../entities/physics_objects'
import { WorldChoice } from './worlds'

type binValsFn = (binInd: number, binCount: number) => number

const outBins: binValsFn = (binInd: number, binCount: number) => {
    return 50 + 50 * Math.abs(binInd - (binCount - 1) / 2)
}

const inBins: binValsFn = (binInd: number, binCount: number) => {
    return 50 * (binCount + 1) / 2 - 50 * Math.abs(binInd - (binCount - 1) / 2)
}

const midBins: binValsFn = (binInd: number, binCount: number) => {
    let midBin = (binCount - 1) / 2
    let dist = Math.min(binInd, Math.abs((binCount - 1) - binInd), Math.abs(midBin - binInd))
    return 50 + 100 * dist
}

function baseWorldInit(state: GameState, bins: number, binVals: binValsFn) {
    const boundsWidth = 250
    const wallWidth = 40
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

    let topBound = new HiddenBoundary(state.world, state.width / 2, -boundsWidth / 2, state.width + 2 * boundsWidth, boundsWidth)
    topBound.addTo(state.stage)
    state.walls.push(topBound)
    // topBound.show()

    let bottomBound = new HiddenBoundary(state.world, state.width / 2, state.height + boundsWidth / 2, state.width + 2 * boundsWidth, boundsWidth)
    bottomBound.addTo(state.stage)
    state.walls.push(bottomBound)
    // bottomBound.show()

    let leftBound = new HiddenBoundary(state.world, -boundsWidth / 2, state.height / 2, boundsWidth, state.height)
    leftBound.addTo(state.stage)
    state.walls.push(leftBound)
    // leftBound.show()

    let rightBound = new HiddenBoundary(state.world, state.width + boundsWidth / 2, state.height / 2, boundsWidth, state.height)
    rightBound.addTo(state.stage)
    state.walls.push(rightBound)
    // rightBound.show()

    return wallWidth
}

export {inBins, outBins, midBins}
export {baseWorldInit}