import * as Matter from 'matter-js'

import { GameState } from './game_state'
import { PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth, Bouncer } from './physics_objects'
import { BouncerCollision, MiscCollision, OrbCollision, PegCollision, ScoreCollision } from './events'

function getCollisionEvent(objA: PhysicsObject, objB: PhysicsObject) {
    if (objA instanceof GoalRect) {
        if (objB instanceof Orb) {
            let event = new ScoreCollision(objB, objA)
            return event
        }
    }
    if (objB instanceof GoalRect) {
        if (objA instanceof Orb) {
            let event = new ScoreCollision(objA, objB)
            return event
        }
    }
    
    if (objA instanceof Peg) {
        if (objB instanceof Orb) {
            let event = new PegCollision(objB, objA)
            return event
        }
    }
    if (objB instanceof Peg) {
        if (objA instanceof Orb) {
            let event = new PegCollision(objA, objB)
            return event
        }
    }
    
    if (objA instanceof Bouncer) {
        if (objB instanceof Orb) {
            let event = new BouncerCollision(objB, objA)
            return event
        }
    }
    if (objB instanceof Bouncer) {
        if (objA instanceof Orb) {
            let event = new BouncerCollision(objA, objB)
            return event
        }
    }

    if (objA instanceof Orb && objB instanceof Orb) {
        let event = new OrbCollision(objA, objB)
        return event
    }

    if (objA instanceof Orb) {
        let event = new MiscCollision(objA, objB)
        return event
    }
    if (objB instanceof Orb) {
        let event = new MiscCollision(objB, objA)
        return event
    }

    console.error("Unknown collision!")
    return null
}

function collisionHandler(event: Matter.IEventCollision<Matter.Engine>, labelMap: Map<string, PhysicsObject>, gameState: GameState) {
    for (let pair of event.pairs) {
        let objA = labelMap.get(pair.bodyA.label)
        let objB = labelMap.get(pair.bodyB.label)
        let event = getCollisionEvent(objA, objB)
        if (event !== null) gameState.enqueueEvent(event)
    }
}

function getCollisionHandler(labelMap: Map<string, PhysicsObject>, gameState: GameState) {
    let handle = (event: Matter.IEventCollision<Matter.Engine>) => {
        collisionHandler(event, labelMap, gameState)
    }

    return handle
}

export {getCollisionHandler}