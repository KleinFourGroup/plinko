import { GameState } from './game_state'
import { PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth, Bouncer } from './physics_objects'

class GameEvent {
    typeStr: string
    constructor(typeStr: string) {
        this.typeStr = typeStr
    }
}

class GameWin extends GameEvent {
    goal: number
    constructor(goal: number) {
        super("gamewin")
        this.goal = goal
    }
}

class GameOver extends GameEvent {
    constructor() {
        super("gameover")
    }
}

class ContinueGame extends GameEvent {
    cc: number
    constructor(cc: number) {
        super("continue")
        this.cc = cc
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

class OrbCollision extends GameEvent {
    orbA: Orb
    orbB: Orb
    constructor(orbA: Orb, orbB: Orb) {
        super("orbhit")
        this.orbA = orbA
        this.orbB = orbB
    }
}

class MiscCollision extends GameEvent {
    orb: Orb
    other: PhysicsObject
    constructor(orb: Orb, other: PhysicsObject) {
        super("mischit")
        this.orb = orb
        this.other = other
    }
}

class OutOfBounds extends GameEvent {
    orb: Orb
    constructor(orb: Orb) {
        super("outofbounds")
        this.orb = orb
    }
}

class RestartEvent extends GameEvent {
    constructor() {
        super("restart")
    }
}

class EndlessEvent extends GameEvent {
    level: number
    constructor(level: number) {
        super("endless")
        this.level = level
    }
}

class GotoMenuEvent extends GameEvent {
    constructor() {
        super("menu")
    }
}

export {
    GameEvent,
    GameWin,
    GameOver,
    ContinueGame,
    LevelUp,
    ScoreCollision,
    PegCollision,
    BouncerCollision,
    OrbCollision,
    MiscCollision,
    OutOfBounds,
    RestartEvent,
    EndlessEvent,
    GotoMenuEvent
}