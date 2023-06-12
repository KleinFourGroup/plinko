import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

import { COLORS } from './colors'
import { Point, labelMap, PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth } from './physics_objects'
import { GameState } from './game_state'

const MAX_SPEED = 10

class Spawner {
    state: GameState
    time: number
    speed: number
    spawnBase: Point
    spawnPoint: Point
    spawnDot: PIXI.Graphics

    constructor(gameState: GameState) {
        this.state = gameState
        this.time = 0.0
        this.speed = 0
        this.spawnBase = {
            x: this.state.width / 2,
            y: 100
        }
        this.spawnPoint = {
            x: this.state.width / 2,
            y: 100
        }

        this.spawnDot = new PIXI.Graphics()
        this.spawnDot.beginFill(COLORS["terminal green"])
        this.spawnDot.drawCircle(0, 0, 5)
        this.spawnDot.endFill()

        this.spawnDot.position.set(this.spawnPoint.x, this.spawnPoint.y)
        this.state.stage.addChild(this.spawnDot)
    }

    addSpeed(difference: number) {
        this.speed += difference
        this.speed = Math.max(Math.min(this.speed, MAX_SPEED), 0)
    }

    spawnOrb() {
        let newOrb = new Orb(this.state.world,  this.spawnPoint.x + (2 * Math.random() - 1), this.spawnPoint.y, 15)
        newOrb.addTo(this.state.stage)
        this.state.orbs.push(newOrb)
    }

    update(delta: number) {
        let progress = this.speed / MAX_SPEED

        let off = Math.abs(Math.sin(this.time)) * (1 + 1.5 * progress)
    
        this.time += (0.1 + 0.9 * off * off) * 3 * delta / 1000
    
        this.spawnPoint.x = this.state.width / 2 + Math.sin(this.time) * (this.state.width - 60) / 2

        this.spawnDot.position.set(this.spawnPoint.x, this.spawnPoint.y)
    }
}

export {Spawner}