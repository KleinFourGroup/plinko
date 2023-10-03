import * as PIXI from 'pixi.js'

import { GameState } from './game_state'
import { UserInterface } from './ui'
import { AppMode } from './mode'
import { AppState } from './app'
import { MenuState } from './menus/menu'
import { BIG_MARGIN, MARGIN } from './cards'

class DisplayState {
    app: AppState
    gameStage: PIXI.Container
    menuStage: PIXI.Container
    gameState: GameState
    ui: UserInterface
    menu: MenuState
    constructor(app: AppState, gameState: GameState, ui: UserInterface, menu: MenuState) {
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
        this.menu.currMenu.refresh() // TODO: This really should be somewhere else!
        this.menu.updateDisplay(this.app.renderer.width, this.app.renderer.height)
    }
}

export {DisplayState}