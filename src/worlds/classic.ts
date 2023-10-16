import { GameState } from '../game_state'
import { labelMap, PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth, Bouncer } from '../entities/physics_objects'
import { baseWorldInit, outBins } from './common'
import { WorldChoice } from './worlds'

function classicWorldInit(state: GameState) {
    const rows = 10
    const cols = 15
    const bins = 7
    
    let wallWidth = baseWorldInit(state, bins, outBins)
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
    id: "classic"
}

export {classicWorld}