import * as PIXI from 'pixi.js'

import { GameState } from './game_state'
import { UserInterface } from './ui'
import { AppMode } from './mode'
import { AppState } from './app'
import { GameMenu } from './menu'
import { BIG_MARGIN, MARGIN } from './cards'

class DisplayState {
    app: AppState
    gameStage: PIXI.Container
    menuStage: PIXI.Container
    gameState: GameState
    ui: UserInterface
    menu: GameMenu
    previewWorld: GameState
    constructor(app: AppState, gameState: GameState, ui: UserInterface, previewWorld: GameState, menu: GameMenu) {
        this.app = app

        this.gameStage = new PIXI.Container()
        this.gameStage.position.set(0, 0)
        this.app.stage.addChild(this.gameStage)

        this.gameState = gameState
        this.gameStage.addChild(this.gameState.box)
        this.ui = ui
        this.gameStage.addChild(this.ui.stage)

        this.menuStage = new PIXI.Container()
        this.menuStage.position.set(0, 0)
        this.app.stage.addChild(this.menuStage)

        this.previewWorld = previewWorld
        this.menuStage.addChild(this.previewWorld.box)

        this.menu = menu
        this.menuStage.addChild(this.menu.stage)
    }

    readMode() {
        switch (this.app.mode) {
            case AppMode.GAME:
                this.updateGame()
                this.gameStage.visible = true
                this.menuStage.visible = false
                break
            case AppMode.MENU:
                this.updateMenu()
                this.gameStage.visible = false
                this.menuStage.visible = true
                break
            default:
                console.error(`(DisplayState) Unknown AppMode: ${this.app.mode}`)
        }
    }

    replaceWorld(gameState: GameState) {
        this.gameStage.removeChild(this.gameState.box)
        this.gameStage.removeChild(this.ui.stage)

        this.gameState = gameState

        this.gameStage.addChild(this.gameState.box)
        this.gameStage.addChild(this.ui.stage)
    }

    replacePreview(previewWorld: GameState) {
        this.menuStage.removeChild(this.previewWorld.box)
        this.menuStage.removeChild(this.menu.stage)

        this.previewWorld = previewWorld

        this.menuStage.addChild(this.previewWorld.box)
        this.menuStage.addChild(this.menu.stage)
    }

    updateGame() {
        // Wow--semicolons are needed
        (this.ui.stage.hitArea as PIXI.Rectangle).width = this.app.renderer.width;
        (this.ui.stage.hitArea as PIXI.Rectangle).height = this.app.renderer.height;

        let topBarHeight = this.ui.topBar.height + 20
        let bottonBarHeight = this.ui.bottomBar.height + 20

        let height = this.app.renderer.height - topBarHeight - bottonBarHeight
        this.ui.topBar.setWidth(Math.min(height, this.app.renderer.width))
        this.ui.bottomBar.setWidth(Math.min(height, this.app.renderer.width))
        let width = Math.max(this.ui.topBar.width, this.ui.bottomBar.width)

        let areaX = (this.app.renderer.width - width) / 2
        let areaY = topBarHeight

        let scale = Math.min(width / this.gameState.width, height / this.gameState.height)
        this.gameState.stage.scale.set(scale, scale)

        let stageX = areaX + (width - scale * this.gameState.width) / 2
        let stageY = areaY + (height - scale * this.gameState.height) / 2

        this.gameState.stage.position.set(stageX, stageY)
        this.ui.topBar.stage.position.set((this.app.renderer.width - this.ui.topBar.width) / 2, 0)
        this.ui.bottomBar.stage.position.set((this.app.renderer.width - this.ui.bottomBar.width) / 2, this.app.renderer.height - bottonBarHeight)

        this.ui.upgradeSelect.box.position.set(
            (this.app.renderer.width - this.ui.upgradeSelect.box.width) / 2,
            (this.app.renderer.height - this.ui.upgradeSelect.box.height) / 2
        )

        this.ui.restartSelect.box.position.set(
            (this.app.renderer.width - this.ui.restartSelect.box.width) / 2,
            (this.app.renderer.height - this.ui.restartSelect.box.height) / 2
        )

        this.ui.winSelect.box.position.set(
            (this.app.renderer.width - this.ui.winSelect.box.width) / 2,
            (this.app.renderer.height - this.ui.winSelect.box.height) / 2
        )
    }

    updateMenu() {
        let height = this.app.renderer.height
        let width = Math.max(Math.min(this.app.renderer.width, height * 16 / 9), 600)

        this.menu.stage.position.set((this.app.renderer.width - width) / 2, 0)

        this.menu.bar.box.position.set(0, 0)
        this.menu.description.update(
            this.menu.bar.box.width + BIG_MARGIN,
            height, 
            width - (this.menu.bar.box.width + MARGIN),
        )

        const barWidth = this.menu.bar.box.width

        let difficultyX = barWidth + MARGIN
        let difficultyW = width - (barWidth + MARGIN)

        this.menu.difficulty.box.position.set(
            difficultyX + (difficultyW - this.menu.difficulty.box.width) / 2,
            MARGIN
        )

        const difficultyHeight = this.menu.difficulty.box.height

        let areaX = this.menu.stage.x + barWidth + MARGIN
        let areaY = this.menu.stage.y + difficultyHeight + MARGIN + BIG_MARGIN
        let areaW = width - (barWidth + MARGIN)
        let areaH = height - (this.menu.description.box.height + difficultyHeight + 2 * MARGIN + 2 * BIG_MARGIN)

        let scale = Math.min(areaW / this.previewWorld.width, areaH / this.previewWorld.height)
        this.previewWorld.stage.scale.set(scale, scale)

        let stageX = areaX + (areaW - scale * this.previewWorld.width) / 2
        let stageY = areaY + (areaH - scale * this.previewWorld.height) / 2
        this.previewWorld.stage.position.set(stageX, stageY)
    }
}

export {DisplayState}