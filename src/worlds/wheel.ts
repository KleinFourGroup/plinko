import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

import { GameState } from '../game_state'
import { labelMap, PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth, Bouncer } from '../entities/physics_objects'
import { WorldChoice } from './worlds'
import { ParametricFn, TimedPath } from '../point'
import { baseWorldInit, inBins, midBins } from './common'

function wheelWorldInit(state: GameState) {
    const numPegs = 24
    const rungs = 4
    const period = 6000
    const bins = 7
    
    let wallWidth = baseWorldInit(state, bins, inBins)

    let pegWidth = (state.width - 2 * wallWidth) * 0.9  - 10
    let pegHeight = (state.height - wallWidth * 3 / 2 - 60) - 200
    let radius = Math.min(pegWidth, pegHeight) / 2
    let pegX = state.width / 2
    let pegY = 200 + pegHeight / 2

    let orbit = (radius:number, time: number) => {
        let x = pegX + radius * Math.sin(time *  2 * Math.PI / period)
        let y = pegY - radius * Math.cos(time *  2 * Math.PI / period)
        return {x: x, y: y}
    }

    let dist = Math.floor((2 * Math.PI * radius) / numPegs)

    for (let rung = rungs; rung > 0; rung--) {
        let pegs = Math.floor((2 * Math.PI * radius * rung) / (dist * rungs))
        for (let num = 0; num < pegs; num++) {
            let startTime = num * period / pegs
            let direction = ((rungs - rung) % 2 == 0) ? 1 : -1
            let path = new TimedPath((time: number) => {
                return orbit(radius * rung / rungs, direction * time)
            })
            let peg = new Peg(state.world, pegX, pegY, 5)
            state.pegArray.add(peg, path, startTime)
        }
    }
}

let wheelWorld: WorldChoice = {
    init: wheelWorldInit,
    id: "wheel"
}

function vortexWorldInit(state: GameState) {
    const numPegs = 12
    const rungs = 4
    const numCenterPegs = 12
    const centerRungs = 3
    const period = 6000
    const bins = 7
    
    let wallWidth = baseWorldInit(state, bins, midBins)

    let pegsWidth = (state.width - 2 * wallWidth) * 0.9  - 10
    let pegsHeight = (state.height - wallWidth * 3 / 2 - 60) - 200
    let pegsX = (state.width - pegsWidth) / 2
    let pegsY = 200

    let radius = Math.min(pegsWidth, pegsHeight) / 4 - 30
    let dist = Math.floor((2 * Math.PI * radius) / numPegs)

    for (let ix = 0; ix < 2; ix++) {
        let signx = (ix == 0) ? 1 : -1
        let pegX = pegsX + pegsWidth * ix + signx * radius
        for (let iy = 0; iy < 2; iy++) {
            let pegY = pegsY + pegsHeight * (2 * iy + 1) / 4

            let direction = ((ix + iy) % 2 == 0) ? 1 : -1

            let orbit = (radius:number, time: number) => {
                let x = pegX + radius * Math.sin(time *  2 * Math.PI / period)
                let y = pegY - radius * Math.cos(time *  2 * Math.PI / period)
                return {x: x, y: y}
            }

            for (let rung = rungs; rung > 0; rung--) {
                let pegs = Math.floor((2 * Math.PI * radius * rung) / (dist * rungs))
                for (let num = 0; num < pegs; num++) {
                    let startTime = num * period / pegs
                    let path = new TimedPath((time: number) => {
                        return orbit(radius * rung / rungs, direction * time)
                    })
                    let peg = new Peg(state.world, pegX, pegY, 5)
                    state.pegArray.add(peg, path, startTime)
                }
            }
        }
    }

    let pegX = state.width / 2
    let pegY = 200 + pegsHeight / 2

    radius = Math.min(pegsWidth, pegsHeight) / 4 - 45
    dist = Math.floor((2 * Math.PI * radius) / numCenterPegs)

    for (let rung = centerRungs; rung > 0; rung--) {
        let pegs = Math.floor((2 * Math.PI * radius * rung) / (dist * centerRungs))
        for (let num = 0; num < pegs; num++) {
            let x = pegX + (radius * rung / centerRungs) * Math.sin(2 * Math.PI * num / pegs)
            let y = pegY - (radius * rung / centerRungs) * Math.cos(2 * Math.PI * num / pegs)

            let peg = new Peg(state.world, x, y, 5)
            state.pegArray.add(peg)
        }
    }
}

let vortexWorld: WorldChoice = {
    init: vortexWorldInit,
    id: "vortex"
}

export {wheelWorld, vortexWorld}