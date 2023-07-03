import * as PIXI from 'pixi.js'

import { DisplayState } from './display'
import { UserInterface } from './ui'
import { GameState } from './game_state'
import { WORLD_LIST, WorldChoice, WorldInitializer } from './worlds'
import { TimingManager } from './timing'
import { InputHandler } from './keyboard'
import { AppMode } from './mode'
import { GameMenu } from './menu'
import { COLORS } from './colors'

class AppState {
    app: PIXI.Application
    stage: PIXI.Container
    renderer: PIXI.IRenderer
    mode: AppMode
    inputs: InputHandler
    currentWorld: WorldChoice
    gameState: GameState
    ui: UserInterface
    previewWorld: GameState
    menu: GameMenu
    perfText: PIXI.Text
    display: DisplayState
    timing: TimingManager

    constructor(app: PIXI.Application) {
        this.app = app
        this.stage = app.stage
        this.renderer = app.renderer

        this.inputs = new InputHandler()

        this.currentWorld = WORLD_LIST[0]

        //  Create the actual game state
        this.gameState = new GameState(this)

        // Create the UI and link it to the gamestate
        this.ui = new UserInterface(this.gameState)

        this.menu = new GameMenu(this)
        
        this.perfText = new PIXI.Text()
        this.perfText.style.fontFamily = "monospace"
        this.perfText.style.fill = COLORS["terminal green"]
        this.perfText.position.set(5, 5)
        this.stage.addChild(this.perfText)

        // Create a display manager to handle various resolutions
        this.display = new DisplayState(this, this.gameState, this.ui)

        // Set up a timing manager
        this.timing = new TimingManager(this.app)
        this.gameState.timing = this.timing

        this.setMode(AppMode.GAME)
    }

    setMode(mode: AppMode) {
        console.assert(this.mode != mode)
        this.mode = mode
        this.timing.clearTimers()
        this.display.readMode()
    }

    setAuto(onAuto: boolean) {
        this.gameState.config.autoControl = onAuto
    }

    init() {
        this.currentWorld.init(this.gameState)
        this.gameState.initializer = this.currentWorld.init
    }

    replaceWorld() {
        let config = this.gameState.config
        this.gameState = new GameState(this, config)
        this.ui.replaceWorld(this.gameState)
        this.display.replaceWorld(this.gameState)
        this.gameState.timing = this.timing

        this.init()
    }

    updatePerf() {
        let fps = this.app.ticker.FPS
        let load = this.timing.load
        let width = this.app.renderer.width
        let height = this.app.renderer.height
        this.perfText.text = `${Math.round(fps)} - ${Math.round((load * 100))}%\ (${width}x${height})` 
    }

    gameUpdate(delta: number) {
        this.timing.beginFrame()
    
        this.timing.beginWork()
    
        this.gameState.parseInput()
        this.inputs.reset()
    
        // Handle the custom event loop
        this.gameState.parseEvents()
    
        // Update timing sensative game logic
        this.gameState.updateFrame(this.timing.delta)
    
        // Update the key game logic
        // if (timing.needsStep(20)) {
            let stepped = this.gameState.updateStep()
            if (stepped) this.timing.step()
        // }
    
        this.gameState.checkGameOver()
    
        //  Match sprites to physics representation
        this.gameState.updateGraphics()
        
        // Update the UI
        this.ui.fetch()
        this.display.updateGame()
        this.ui.draw()
        
        this.updatePerf()

        this.timing.endWork()
    }

    menuUpdate(delta: number) {
        this.timing.beginFrame()
    
        this.timing.beginWork()
    
        this.menu.parseInput()
        this.inputs.reset()
        
        this.updatePerf()

        this.timing.endWork()
    }
}

export {AppMode, AppState}