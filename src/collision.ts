import * as Matter from 'matter-js'

import { GameState } from './game_state'
import { Point, PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth } from './physics_objects'

class SimEvent {
    typeStr: string
    constructor(typeStr: string) {
        this.typeStr = typeStr
    }
}

class ScoreCollision extends SimEvent {
    orb: Orb
    goal: GoalRect
    constructor(orb: Orb, goal: GoalRect) {
        super("score")
        this.orb = orb
        this.goal = goal
    }
}

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
    }
}

function getCollisionHandler(labelMap: Map<string, PhysicsObject>, gameState: GameState) {
    let handle = (event: Matter.IEventCollision<Matter.Engine>) => {
        collisionHandler(event, labelMap, gameState)
    }

    return handle
}

export {SimEvent, ScoreCollision}
export {getCollisionHandler}