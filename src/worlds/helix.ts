import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

import { GameState } from '../game_state'
import { labelMap, PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth, Bouncer } from '../physics_objects'
import { WorldChoice } from './worlds'
import { ParametricFn, TimedPath } from '../point'
import { baseWorldInit, inBins } from './common'

function helixWorldInit(state: GameState) {
    const rungs = 32
    const period = 4000
    const bins = 7
    
    let wallWidth = baseWorldInit(state, bins, inBins)

    let pegsWidth = (state.width - 2 * wallWidth) * 0.9  - 10
    let pegsHeight = (state.height - wallWidth * 3 / 2 - 60) - 200
    
    let pegsX = (state.width - pegsWidth) / 2
    let pegsY = 200

    for (let index = 0; index < 4; index++) {
        let helixX = pegsX + pegsWidth * (2 * index + 1) / 8
        for (let rung = 0; rung < rungs; rung++) {
            let helixY = pegsY + pegsHeight * rung / (rungs - 1)
            let orbit = (time: number) => {
                let x = helixX + (0.75 * pegsWidth / 8) * Math.sin(time *  2 * Math.PI / period)
                let y = helixY
                return {x: x, y: y}
            }

            let startTime = period * 4 * rung / (rungs - 1)
            let path = new TimedPath(orbit)
            let peg = new Peg(state.world, helixX, helixY, 5)
            state.pegArray.add(peg, path, startTime)
        }
    }
}

let helixWorld: WorldChoice = {
    init: helixWorldInit,
    title: "Helixes",
    description: "Four helixes rotating over a row of goals."
}

export {helixWorld}