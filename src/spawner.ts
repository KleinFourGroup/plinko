import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

import { COLORS } from './colors'
import { labelMap, PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth } from './entities/physics_objects'
import { Point } from './point'
import { GameState } from './game_state'

const MAX_SPEED = 100
const MAX_VELOCITY = 15

class Spawner {
    state: GameState
    time: number
    speed: number
    dropCount: number
    dropScore: number
    velocity: number
    balls: number
    ballsUsed: number
    spawnBase: Point
    spawnPoint: Point
    spawnDot: PIXI.Graphics

    constructor(gameState: GameState) {
        this.state = gameState
        this.time = 0.0
        this.dropCount = 1
        this.dropScore = 0
        this.velocity = 0
        this.speed = Math.round(MAX_SPEED / 2)
        
        this.balls = 5
        this.ballsUsed = 0

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

    addBalls(extra: number) {
        this.balls += extra
    }

    addScore(score: number) {
        this.dropScore += score
    }

    spawnOrb(override: boolean = false) {
        this.dropScore = 0

        if (this.ballsUsed < this.balls || override) {
            for (let count = 0; count < this.dropCount; count++) {
                let newOrb = new Orb(this.state.world,  this.spawnPoint.x + (2 * Math.random() - 1), this.spawnPoint.y + (2 * Math.random() - 1), 15)
                let sigVel = Math.sign(this.velocity) * (2 * MAX_VELOCITY / (1 + Math.exp(-2 * Math.abs(this.velocity) / MAX_VELOCITY)) - MAX_VELOCITY)
                let inaccuracy = this.speed / MAX_SPEED
                Matter.Body.setVelocity(newOrb.body, {x: sigVel * (0.95 + 0.05 * Math.random()) * inaccuracy, y: 0})
                newOrb.addTo(this.state.stage)
                this.state.orbs.push(newOrb)
            }
            
            this.ballsUsed++
        }
    }

    // update(delta: number) {
    //     let progress = this.speed / MAX_SPEED

    //     let off = Math.abs(Math.sin(this.time)) * (1 + 1.5 * progress)
    
    //     this.time += (0.1 + 0.9 * off * off) * 3 * delta / 1000

    //     let oldX = this.spawnPoint.x
    
    //     this.spawnPoint.x = this.state.width / 2 + Math.sin(this.time) * (this.state.width - 70) / 2

    //     this.velocity = ((this.spawnPoint.x - oldX) / delta) * 16.67

    //     this.spawnDot.position.set(this.spawnPoint.x, this.spawnPoint.y)
    // }

    update(delta: number) {
        let progress = this.speed / MAX_SPEED

        let off = Math.abs(Math.sin(this.time)) * (0.5 + progress)
    
        this.time += (0.2 + 0.8 * off * off) * 3 * delta / 1000

        let oldX = this.spawnPoint.x
    
        this.spawnPoint.x = this.spawnBase.x + Math.sin(this.time) * (this.state.width - 70) / 2

        this.velocity = ((this.spawnPoint.x - oldX) / delta) * 16.67

        this.spawnDot.position.set(this.spawnPoint.x, this.spawnPoint.y)
    }
}

export {Spawner}