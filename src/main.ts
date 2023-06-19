import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

import { COLORS } from './colors'
import { DisplayState, UserInterface } from './ui'
import { GameState, initWorld } from './game_state'
import { getCollisionHandler } from './collision'
import { Point, labelMap, PhysicsObject, BarrierRect, BarrierPoly, GoalRect, Orb, Peg, Tooth } from './physics_objects'
import { TimingManager } from './timing'

// Create the application
let app = new PIXI.Application({ resizeTo: window, background: COLORS["terminal black"], antialias: true });

// Attach the app to the page
// @ts-ignore
document.body.appendChild(app.view);

//  Create the actual game state
let gameState = new GameState()
//  Testing only - game will play automatically
gameState.autoControl = true

// Create the UI and link it to the gamestate
let ui = new UserInterface(gameState)
gameState.upgradeSelect = ui.upgradeSelect

// Create a display manager to handle various resolutions
let display = new DisplayState(app, gameState, ui)

// Initialize the game state
initWorld(gameState)

// Link physics events to the gamestate
let collisionHandler = getCollisionHandler(labelMap, gameState)
Matter.Events.on(gameState.engine, "collisionStart", collisionHandler)

// Set up a timing manager
let timing = new TimingManager(app)
gameState.timing = timing

// The main game loop
// delta is in frames, not ms =()
function update(delta: number) {
    timing.beginFrame()

    timing.beginWork()

    // Handle the custom event loop
    gameState.parseEvents()

    // Update timing sensative game logic
    gameState.updateFrame(timing.delta)

    // Update the key game logic
    // if (timing.needsStep(20)) {
        let stepped = gameState.updateStep()
        if (stepped) timing.step()
    // }

    //  Match sprites to physics representation
    gameState.updateGraphics()
    
    // Update the UI
    ui.fetch(app.ticker.FPS, timing.load)
    display.update()
    ui.draw()
    
    timing.endWork()
}

// Keyboard input listener
// TODO: Move to UI
addEventListener("keydown", (event) => {gameState.spawn = true})

// Run the game loop
app.ticker.add(update);