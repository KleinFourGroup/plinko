import * as Matter from 'matter-js'

import { GameState } from './game_state'
import { PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth, Bouncer } from './physics_objects'
import { BouncerCollision, PegCollision, ScoreCollision } from './events'

function collisionHandler(event: Matter.IEventCollision<Matter.Engine>, labelMap: Map<string, PhysicsObject>, gameState: GameState) {
    for (let pair of event.pairs) {
        let objA = labelMap.get(pair.bodyA.label)
        let objB = labelMap.get(pair.bodyB.label)
        if (objA instanceof GoalRect) {
            if (objB instanceof Orb) {
                let event = new ScoreCollision(objB, objA)
                gameState.enqueueEvent(event)
            }
        }
        if (objB instanceof GoalRect) {
            if (objA instanceof Orb) {
                let event = new ScoreCollision(objA, objB)
                gameState.enqueueEvent(event)
            }
        }
        
        if (objA instanceof Peg) {
            if (objB instanceof Orb) {
                let event = new PegCollision(objB, objA)
                gameState.enqueueEvent(event)
            }
        }
        if (objB instanceof Peg) {
            if (objA instanceof Orb) {
                let event = new PegCollision(objA, objB)
                gameState.enqueueEvent(event)
            }
        }
        
        if (objA instanceof Bouncer) {
            if (objB instanceof Orb) {
                let event = new BouncerCollision(objB, objA)
                gameState.enqueueEvent(event)
            }
        }
        if (objB instanceof Bouncer) {
            if (objA instanceof Orb) {
                let event = new BouncerCollision(objA, objB)
                gameState.enqueueEvent(event)
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