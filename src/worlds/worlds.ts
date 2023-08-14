import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

import { GameState } from '../game_state'
import { labelMap, PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth, Bouncer } from '../physics_objects'
import { classicWorld } from './classic'
import { squareWorld } from './square'
import { wheelWorld } from './wheel'
import { helixWorld } from './helix'

type WorldInitializer = (state: GameState) => void

type WorldChoice = {
    init: WorldInitializer,
    title: string,
    description: string
}

const WORLD_LIST = [
    classicWorld,
    squareWorld,
    wheelWorld,
    helixWorld
]

export {WorldInitializer, WorldChoice}
export {WORLD_LIST}