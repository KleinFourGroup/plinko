import { GameState } from './game_state'
import { Point, PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth, Bouncer } from './physics_objects'

class GameEvent {
    typeStr: string
    constructor(typeStr: string) {
        this.typeStr = typeStr
    }
}

class LevelUp extends GameEvent {
    level: number
    constructor(level: number) {
        super("levelup")
        this.level = level
    }
}

class ScoreCollision extends GameEvent {
    orb: Orb
    goal: GoalRect
    constructor(orb: Orb, goal: GoalRect) {
        super("score")
        this.orb = orb
        this.goal = goal
    }
}

class PegCollision extends GameEvent {
    orb: Orb
    peg: Peg
    constructor(orb: Orb, peg: Peg) {
        super("peghit")
        this.orb = orb
        this.peg = peg
    }
}

class BouncerCollision extends GameEvent {
    orb: Orb
    bouncer: Bouncer
    constructor(orb: Orb, bouncer: Bouncer) {
        super("bouncerhit")
        this.orb = orb
        this.bouncer = bouncer
    }
}

class OutOfBounds extends GameEvent {
    orb: Orb
    constructor(orb: Orb) {
        super("outofbounds")
        this.orb = orb
    }
}

export {GameEvent, LevelUp, ScoreCollision, PegCollision, BouncerCollision, OutOfBounds}