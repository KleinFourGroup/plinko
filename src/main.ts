import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

import { COLORS } from './colors'
import { AppMode, AppState } from './app'
import { WORLD_LIST } from './worlds/worlds'
import { keydownHandler } from './keyboard'
import { DEV_BUILD } from './global_consts'

// Create the application
let app = new PIXI.Application({ resizeTo: window, background: COLORS["terminal black"], antialias: true });

// Attach the app to the page
// @ts-ignore
document.body.appendChild(app.view);

let game = new AppState(app)
// game.init()
if (DEV_BUILD) {
    game.setAuto(true)
}

// The main game loop
// delta is in frames, not ms =()
function update(delta: number) {
    switch (game.mode) {
        case AppMode.GAME:
            game.gameUpdate(delta)
            break
        case AppMode.MENU:
            game.menuUpdate(delta)
            break
        default:
            console.error(`Unknown AppMode: ${game.mode}`)
    }
}

// Keyboard input listener
addEventListener("keydown", (event) => {keydownHandler(event, game)})

// Run the game loop
app.ticker.add(update);