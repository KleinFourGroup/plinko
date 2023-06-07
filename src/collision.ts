import * as Matter from 'matter-js'

import { GameState } from './game_state'
import { Point, PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth } from './physics_objects'

function collisionHandler(event: Matter.IEventCollision<Matter.Engine>, labelMap: Map<string, PhysicsObject>, gameState: GameState) {
    for (let pair of event.pairs) {
        let objA = labelMap.get(pair.bodyA.label)
        let objB = labelMap.get(pair.bodyB.label)
        if (objA instanceof GoalRect) {
            if (objB instanceof Orb) {
                objB.removeFrom(gameState.stage)
                labelMap.delete(pair.bodyB.label)
                objB.delete()
                gameState.orbs.splice(gameState.orbs.indexOf(objB), 1)
                gameState.levelState.add(objA.score)
            }
        }
        if (objB instanceof GoalRect) {
            if (objA instanceof Orb) {
                objA.removeFrom(gameState.stage)
                labelMap.delete(pair.bodyA.label)
                objA.delete()
                gameState.orbs.splice(gameState.orbs.indexOf(objA), 1)
                gameState.levelState.add(objB.score)
            }
        }
    }
}

function getCollisionHandler(labelMap: Map<string, PhysicsObject>, gameState: GameState) {
    let handle = (event: Matter.IEventCollision<Matter.Engine>) => {
        collisionHandler(event, labelMap, gameState)
    }

    return handle
}

export {getCollisionHandler}