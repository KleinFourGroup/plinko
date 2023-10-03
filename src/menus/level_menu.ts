import * as PIXI from 'pixi.js'

import { AppState, MAX_STEPS, STEP } from '../app'
import { WorldChoice, getLevelData } from '../worlds/worlds'
import { SelectorBar } from '../selector/select_world'
import { COLORS } from '../colors'
import { BIG_MARGIN, MARGIN } from '../cards'
import { DifficultySelect } from '../selector/select_difficulty'
import { GameState, PREVIEW_CONFIG } from '../game_state'
import { GameMenuI, MenuState } from './menu'

const worldDescStyle = new PIXI.TextStyle({
    wordWrap: true,
    fontFamily: "monospace",
    fill: COLORS["terminal amber"]
})

class WorldDescription {
    menu: LevelSelectMenu
    box: PIXI.Container
    background: PIXI.Graphics
    text: PIXI.Text
    width: number
    height: number

    constructor(menu: LevelSelectMenu) {
        this.menu = menu
        this.box = new PIXI.Container()
        this.menu.selectStage.addChild(this.box)

        this.background = new PIXI.Graphics()
        this.box.addChild(this.background)

        this.text = new PIXI.Text("?", worldDescStyle)
        this.text.position.set(MARGIN, MARGIN)
        this.box.addChild(this.text)
        
        this.width = null
        this.height = null
    }

    update(x: number, y: number, width: number) {
        if (this.width !== width) this.text.style.wordWrapWidth = width - 2 * MARGIN

        let progress = this.menu.gameApp.progressTracker
        let id = this.menu.activeSelection.id
        this.text.text = `${getLevelData(id, "description")}\n\nHigh score: ${progress.getHighScore(id)}`

        if (this.width !== width || this.height !== this.text.height + 2 * MARGIN) {
            this.width = width
            this.height = this.text.height + 2 * MARGIN
            
            this.background.clear()
            this.background.lineStyle(3, COLORS["terminal amber"])
            this.background.beginFill(COLORS["dark terminal amber"])
            this.background.drawRect(0, 0, this.width, this.height)
            this.background.endFill()
        }

        this.box.position.set(x, y - this.height - MARGIN)
    }
}

class LevelSelectMenu implements GameMenuI {
    gameApp: AppState
    menuState: MenuState
    stage: PIXI.Container
    selectStage: PIXI.Container
    bar: SelectorBar
    activeSelection: WorldChoice
    difficulty: DifficultySelect
    description: WorldDescription
    previewWorld: GameState

    constructor(menuState: MenuState) {
        this.menuState = menuState
        this.gameApp = this.menuState.gameApp
        this.stage = new PIXI.Container()
        this.selectStage = new PIXI.Container()

        this.activeSelection = null
        this.bar = new SelectorBar(this)
        this.difficulty = new DifficultySelect(this)
        this.description = new WorldDescription(this)
        this.previewWorld = new GameState(this.gameApp, PREVIEW_CONFIG)
        
        this.stage.addChild(this.previewWorld.box)
        this.stage.addChild(this.selectStage)
    }

    parseInput() {
        this.bar.parseInput()
        this.difficulty.parseInput()
    }

    refresh() {
        this.bar.loadWorlds()
    }

    initPreview() {
        this.activeSelection.init(this.previewWorld)
        this.previewWorld.initializer = this.activeSelection.init
        this.previewWorld.id = this.activeSelection.id
    }

    replacePreview() {
        let config = this.previewWorld.config
        // this.gameApp.display.replacePreview(this.previewWorld)
        this.stage.removeChild(this.previewWorld.box)
        this.stage.removeChild(this.selectStage)
        this.previewWorld = new GameState(this.gameApp, config)
        this.stage.addChild(this.previewWorld.box)
        this.stage.addChild(this.selectStage)
        this.previewWorld.timing = this.gameApp.timing

        this.initPreview()
    }

    updateFrame(delta: number) {
        if (this.activeSelection.init !== this.previewWorld.initializer) {
            console.log("New preview!")
            this.replacePreview()
        }

        this.previewWorld.parseEvents()
        
        let steps = this.gameApp.timing.getSteps(STEP)
        if (steps > 0) this.previewWorld.updateStep(Math.min(steps, MAX_STEPS), STEP)
        this.gameApp.timing.step(steps, STEP)

        this.previewWorld.updateFrame(this.gameApp.timing.delta)
        this.previewWorld.updateGraphics()
    }

    updateDisplay(renderWidth: number, renderHeight: number) {
        let height = renderHeight
        let width = Math.max(Math.min(renderWidth, height * 16 / 9), 600)

        this.selectStage.position.set((renderWidth - width) / 2, 0)

        this.bar.box.position.set(0, 0)
        this.description.update(
            this.bar.box.width + BIG_MARGIN,
            height, 
            width - (this.bar.box.width + MARGIN),
        )

        const barWidth = this.bar.box.width

        let difficultyX = barWidth + MARGIN
        let difficultyW = width - (barWidth + MARGIN)

        this.difficulty.box.position.set(
            difficultyX + (difficultyW - this.difficulty.box.width) / 2,
            MARGIN
        )

        const difficultyHeight = this.difficulty.box.height

        let areaX = this.selectStage.x + barWidth + MARGIN
        let areaY = this.selectStage.y + difficultyHeight + MARGIN + BIG_MARGIN
        let areaW = width - (barWidth + MARGIN)
        let areaH = height - (this.description.box.height + difficultyHeight + 2 * MARGIN + 2 * BIG_MARGIN)

        let scale = Math.min(areaW / this.previewWorld.width, areaH / this.previewWorld.height)
        this.previewWorld.stage.scale.set(scale, scale)

        let stageX = areaX + (areaW - scale * this.previewWorld.width) / 2
        let stageY = areaY + (areaH - scale * this.previewWorld.height) / 2
        this.previewWorld.stage.position.set(stageX, stageY)
    }
}

export {LevelSelectMenu}