import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

import { COLORS } from './colors'
import { DisplayState, UserInterface } from './ui'
import { GameState, initWorld } from './game_state'
import { getCollisionHandler } from './collision'
import { Point, labelMap, PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth } from './physics_objects'
import { TimingManager } from './timing'

// Create the application helper and add its render target to the page
let app = new PIXI.Application({ resizeTo: window, background: COLORS["terminal black"], antialias: true });

// @ts-ignore
document.body.appendChild(app.view);

let gameState = new GameState()
let ui = new UserInterface(gameState)
gameState.upgradeSelect = ui.upgradeSelect
let display = new DisplayState(app, gameState, ui)

let spawn = false

initWorld(gameState)

let collisionHandler = getCollisionHandler(labelMap, gameState)

Matter.Events.on(gameState.engine, "collisionStart", collisionHandler)


let timing = new TimingManager(app)

// delta is in frames, not ms =()
function update(delta: number) {
    timing.beginFrame()

    timing.beginWork()

    gameState.parseEvents()

    gameState.spawner.update(timing.delta, gameState.levelState.level)

    if (gameState.running && timing.needsStep(20)) {
        timing.step()
        Matter.Engine.update(gameState.engine, 20)
    }

    if (spawn) {
        spawn = false
        if (gameState.running && gameState.orbs.length == 0) {
            gameState.spawner.spawnOrb()
        }
    }

    display.update()
    gameState.updateGraphics()
    ui.update(app.ticker.FPS, timing.load)
    
    timing.endWork()
}

addEventListener("click", (event) => {spawn = true})
addEventListener("pointerdown", (event) => {spawn = true})
addEventListener("keydown", (event) => {spawn = true})

app.ticker.add(update);