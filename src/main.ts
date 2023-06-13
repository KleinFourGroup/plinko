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
gameState.autoControl = true
let ui = new UserInterface(gameState)
gameState.upgradeSelect = ui.upgradeSelect
let display = new DisplayState(app, gameState, ui)

let spawn = false

initWorld(gameState)

let collisionHandler = getCollisionHandler(labelMap, gameState)

Matter.Events.on(gameState.engine, "collisionStart", collisionHandler)


let timing = new TimingManager(app)
gameState.timing = timing

// delta is in frames, not ms =()
function update(delta: number) {
    timing.beginFrame()

    timing.beginWork()

    gameState.parseEvents()

    gameState.updateFrame(timing.delta)

    // if (timing.needsStep(20)) {
        let stepped = gameState.updateStep()
        if (stepped) timing.step()
    // }

    gameState.updateGraphics()
    
    ui.fetch(app.ticker.FPS, timing.load)
    display.update()
    ui.draw()
    
    timing.endWork()
}

addEventListener("click", (event) => {gameState.spawn = true})
addEventListener("pointerdown", (event) => {gameState.spawn = true})
addEventListener("keydown", (event) => {gameState.spawn = true})

app.ticker.add(update);