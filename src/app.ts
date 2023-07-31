import * as PIXI from 'pixi.js'

import { DisplayState } from './display'
import { UserInterface } from './ui'
import { GameState, PREVIEW_CONFIG } from './game_state'
import { WORLD_LIST, WorldChoice, WorldInitializer } from './worlds/worlds'
import { TimingManager } from './timing'
import { InputHandler } from './keyboard'
import { AppMode } from './mode'
import { GameMenu } from './menu'
import { COLORS } from './colors'
import { SoundManager } from './sounds'

const STEP = 1000 / 240

class AppState {
    app: PIXI.Application
    stage: PIXI.Container
    renderer: PIXI.IRenderer
    soundManager: SoundManager
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
        this.soundManager = new SoundManager()

        this.currentWorld = WORLD_LIST[0]

        //  Create the actual game state
        this.gameState = new GameState(this)

        // Create the UI and link it to the gamestate
        this.ui = new UserInterface(this.gameState)

        this.previewWorld = new GameState(this, PREVIEW_CONFIG)

        this.menu = new GameMenu(this)

        // Create a display manager to handle various resolutions
        this.display = new DisplayState(this, this.gameState, this.ui, this.previewWorld, this.menu)
        
        this.perfText = new PIXI.Text()
        this.perfText.style.fontFamily = "monospace"
        this.perfText.style.fill = COLORS["terminal green"]
        this.perfText.style.align = "right"
        this.perfText.alpha = 0.5
        this.perfText.anchor.set(1, 0)
        this.perfText.position.set(this.app.renderer.width - 5, 5)
        this.stage.addChild(this.perfText)

        // Set up a timing manager
        this.timing = new TimingManager(this.app)
        this.gameState.timing = this.timing

        this.setMode(AppMode.MENU)
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

    initPreview() {
        this.menu.activeSelection.init(this.previewWorld)
        this.previewWorld.initializer = this.menu.activeSelection.init
    }

    replaceWorld() {
        let config = this.gameState.config
        this.gameState = new GameState(this, config)
        this.ui.replaceWorld(this.gameState)
        this.display.replaceWorld(this.gameState)
        this.gameState.timing = this.timing

        this.init()
    }

    replacePreview() {
        let config = this.previewWorld.config
        this.previewWorld = new GameState(this, config)
        this.display.replacePreview(this.previewWorld)
        this.previewWorld.timing = this.timing

        this.initPreview()
    }

    updatePerf(steps: number) {
        let fps = this.app.ticker.FPS
        let load = this.timing.load
        let width = this.app.renderer.width
        let height = this.app.renderer.height
        this.perfText.text = `${Math.round(fps)} FPS\n${(Math.round((load * 1000)) / 10).toFixed(1)}% load\n${steps} ticks\n${width}x${height}`
        this.perfText.position.set(this.app.renderer.width - 5, 5)
    }

    gameUpdate(delta: number) {
        this.timing.beginFrame()
    
        this.timing.beginWork()
    
        this.gameState.parseInput()
        this.inputs.reset()
    
        // Handle the custom event loop
        this.gameState.parseEvents()
    
        let steps = this.timing.getSteps(STEP)
        if (steps > 0) this.gameState.updateStep(steps, STEP)
        this.timing.step(steps, STEP)
    
        // Update timing sensative game logic
        this.gameState.updateFrame(this.timing.delta)
    
        this.gameState.checkGameOver()
    
        //  Match sprites to physics representation
        this.gameState.updateGraphics()
        
        // Update the UI
        this.ui.fetch()
        this.display.updateGame()
        this.ui.draw()
        
        this.updatePerf(steps)

        this.timing.endWork()
    }

    menuUpdate(delta: number) {
        this.timing.beginFrame()
    
        this.timing.beginWork()
    
        this.menu.parseInput()
        this.inputs.reset()

        if (this.menu.activeSelection.init !== this.previewWorld.initializer) {
            console.log("New preview!")
            this.replacePreview()
        }

        this.previewWorld.parseEvents()
        
        let steps = this.timing.getSteps(STEP)
        if (steps > 0) this.previewWorld.updateStep(steps, STEP)
        this.timing.step(steps, STEP)

        this.previewWorld.updateFrame(this.timing.delta)
        this.previewWorld.updateGraphics()

        this.display.updateMenu()
        
        this.updatePerf(steps)

        this.timing.endWork()
    }
}

export {AppMode, AppState}