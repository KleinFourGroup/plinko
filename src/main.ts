import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

import { COLORS } from './colors'
import { DisplayState, UserInterface } from './ui'
import { GameState, initWorld } from './game_state'
import { getCollisionHandler } from './collision'
import { Point, labelMap, PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth } from './physics_objects'

// Create the application helper and add its render target to the page
let app = new PIXI.Application({ resizeTo: window, background: COLORS["terminal black"], antialias: true });

// @ts-ignore
document.body.appendChild(app.view);

let gameState = new GameState()
let ui = new UserInterface()
let display = new DisplayState(app, gameState, ui)

let spawn = false

initWorld(gameState)

let collisionHandler = getCollisionHandler(labelMap, gameState)

Matter.Events.on(gameState.engine, "collisionStart", collisionHandler)

let intervalsTotal: Array<number> = []
let intervalsWork: Array<number> = []

let lastWork = 0

// Add a ticker callback to move the sprite back and forth
let lastStep = 0
let lastTick = 0
let elapsed = 0.0;

let spawnTot = 0.0

// delta is in frames, not ms =()
function update(delta: number) {
    let deltaMS: number = app.ticker.deltaMS

    intervalsTotal.push(deltaMS)
    intervalsWork.push(lastWork)

    if (intervalsTotal.length > 20) {
        intervalsTotal.shift()
        intervalsWork.shift()
    }

    let load = intervalsWork.reduce((a, b) => a + b, 0) / intervalsTotal.reduce((a, b) => a + b, 0)
    
    elapsed += deltaMS;

    let startWork = performance.now()

    gameState.parseEvents()

    gameState.spawner.update(deltaMS, gameState.levelState.level)

    if (elapsed - lastStep >= 20) {
        lastStep = Math.floor(elapsed)
        Matter.Engine.update(gameState.engine, 20)
    }

    // if (spawn) {
    if (elapsed - lastTick >= 1000 || spawn) {
        spawn = false
        lastTick = Math.floor(elapsed)
        if (gameState.orbs.length < 15) {
            gameState.spawner.spawnOrb()
        }
    }

    display.update()
    gameState.updateGraphics()
    ui.update(app.ticker.FPS, load, gameState)
    
    let endWork = performance.now()

    lastWork = endWork - startWork
}

addEventListener("click", (event) => {spawn = true})
addEventListener("pointerdown", (event) => {spawn = true})
addEventListener("keydown", (event) => {spawn = true})

app.ticker.add(update);