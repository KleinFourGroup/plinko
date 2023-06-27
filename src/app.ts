import * as PIXI from 'pixi.js'

import { DisplayState, UserInterface } from './ui'
import { GameState, WorldInitializer } from './game_state'
import { TimingManager } from './timing'
import { InputHandler } from './keyboard'

class AppState {
    app: PIXI.Application
    inputs: InputHandler
    gameState: GameState
    ui: UserInterface
    display: DisplayState
    timing: TimingManager

    constructor(app: PIXI.Application) {
        this.app = app
        
        this.inputs = new InputHandler()

        //  Create the actual game state
        this.gameState = new GameState(this)

        // Create the UI and link it to the gamestate
        this.ui = new UserInterface(this.gameState)

        // Create a display manager to handle various resolutions
        this.display = new DisplayState(this.app, this.gameState, this.ui)

        // Set up a timing manager
        this.timing = new TimingManager(this.app)
        this.gameState.timing = this.timing
    }

    setAuto(onAuto: boolean) {
        this.gameState.autoControl = onAuto
    }

    init(initWorld: WorldInitializer) {
        initWorld(this.gameState)
        this.gameState.initializer = initWorld
    }

    replaceWorld(initWorld: WorldInitializer) {
        let isAuto = this.gameState.autoControl
        this.gameState = new GameState(this)
        this.ui.replaceWorld(this.gameState)
        this.display.replaceWorld(this.gameState)
        this.gameState.timing = this.timing

        this.init(initWorld)
        this.setAuto(isAuto)
    }
}

export {AppState}