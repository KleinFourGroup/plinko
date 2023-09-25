import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

import { GameState } from '../game_state'
import { labelMap, PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth, Bouncer } from '../physics_objects'
import { WorldChoice } from './worlds'
import { ParametricFn, TimedPath } from '../point'
import { baseWorldInit, inBins } from './common'

function helixBuilerWorldInit(state: GameState, helixCount: number, rungs: number, rotations: number, period: number) {
    const bins = 7
    
    let wallWidth = baseWorldInit(state, bins, inBins)

    let pegsWidth = (state.width - 2 * wallWidth) * 0.9  - 10
    let pegsHeight = (state.height - wallWidth * 3 / 2 - 60) - 200
    
    let pegsX = (state.width - pegsWidth) / 2
    let pegsY = 200

    for (let index = 0; index < helixCount; index++) {
        let helixX = pegsX + pegsWidth * (2 * index + 1) / (2 * helixCount)
        for (let rung = 0; rung < rungs; rung++) {
            let helixY = pegsY + pegsHeight * rung / (rungs - 1)
            let orbit = (time: number) => {
                let x = helixX + (pegsWidth / (2 * helixCount) - 20) * Math.sin(time *  2 * Math.PI / period)
                let y = helixY
                return {x: x, y: y}
            }

            let startTime = period * rotations * rung / (rungs - 1)
            let path = new TimedPath(orbit)
            let peg = new Peg(state.world, helixX, helixY, 5)
            state.pegArray.add(peg, path, startTime)
        }
    }
}

function helixWorldInit(state: GameState) {
    helixBuilerWorldInit(state, 1, 48, 2, 6000)
}

function helixesWorldInit(state: GameState) {
    helixBuilerWorldInit(state, 4, 32, 4, 3000)
}

let helixWorld: WorldChoice = {
    init: helixWorldInit,
    id: "1helix"
}

let helixesWorld: WorldChoice = {
    init: helixesWorldInit,
    id: "4helix"
}

export {helixWorld, helixesWorld}