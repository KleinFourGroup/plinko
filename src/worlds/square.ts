import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

import { GameState } from '../game_state'
import { labelMap, PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth, Bouncer } from '../entities/physics_objects'
import { WorldChoice } from './worlds'
import { baseWorldInit, outBins } from './common'

function squareWorldInit(state: GameState) {
    const rows = 6
    const cols = 9
    const bins = 7
    
    let wallWidth = baseWorldInit(state, bins, outBins)
    let pegWidth = (state.width - 2 * wallWidth) * 0.9  - 10

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            let x = (state.width - pegWidth) / 2 + (pegWidth / (cols - 1)) * col
            let y = state.height - wallWidth * 3 / 2 - 60 - (pegWidth / (cols - 1)) * row
            let peg = new Peg(state.world, x, y, 5)
            state.pegArray.add(peg)
        }
    }
}

let squareWorld: WorldChoice = {
    init: squareWorldInit,
    id: "square"
}

export {squareWorld}