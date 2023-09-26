import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

import { GameState } from '../game_state'
import { labelMap, PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth, Bouncer } from '../physics_objects'
import { classicWorld } from './classic'
import { squareWorld } from './square'
import { vortexWorld, wheelWorld } from './wheel'
import { helixWorld, helixesWorld } from './helix'

import levelData from './levels.json'

type WorldInitializer = (state: GameState) => void

type WorldChoice = {
    init: WorldInitializer,
    id: string
}

const WORLD_LIST = [
    classicWorld,
    squareWorld,
    wheelWorld,
    helixWorld,
    vortexWorld,
    helixesWorld
]

const WORLD_IDS = WORLD_LIST.map((world) => world.id)

function isKeyof<T extends object>(obj: T, possibleKey: keyof any): possibleKey is keyof T {
    return possibleKey in obj;
  } 

function getLevelData(id: string, property: string) {
    if (isKeyof(levelData, id)) {
        let world = levelData[id]
        if (isKeyof(world, property)) {
            return world[property]
        }
    }

    return "?"
}

export {WorldInitializer, WorldChoice}
export {WORLD_LIST, WORLD_IDS}
export {getLevelData}