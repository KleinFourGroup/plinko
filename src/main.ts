import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

import { COLORS } from './colors'
import { AppState } from './app'
import { initWorld } from './game_state'
import { keydownHandler } from './keyboard'

// Create the application
let app = new PIXI.Application({ resizeTo: window, background: COLORS["terminal black"], antialias: true });

// Attach the app to the page
// @ts-ignore
document.body.appendChild(app.view);

let game = new AppState(app)
game.init(initWorld)
game.setAuto(true)

// The main game loop
// delta is in frames, not ms =()
function update(delta: number) {
    game.timing.beginFrame()

    game.timing.beginWork()

    game.gameState.parseInput()
    game.inputs.reset()

    // Handle the custom event loop
    game.gameState.parseEvents()

    // Update timing sensative game logic
    game.gameState.updateFrame(game.timing.delta)

    // Update the key game logic
    // if (timing.needsStep(20)) {
        let stepped = game.gameState.updateStep()
        if (stepped) game.timing.step()
    // }

    game.gameState.checkGameOver()

    //  Match sprites to physics representation
    game.gameState.updateGraphics()
    
    // Update the UI
    game.ui.fetch(app.ticker.FPS, game.timing.load)
    game.display.update()
    game.ui.draw()
    
    game.timing.endWork()
}

// Keyboard input listener
addEventListener("keydown", (event) => {keydownHandler(event, game)})

// Run the game loop
app.ticker.add(update);