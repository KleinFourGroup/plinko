import * as PIXI from 'pixi.js'

import { COLORS } from './colors'
import { GameState } from './game_state'
import { TopBar, StatsBar } from './bars'
import { UpgradeSelect } from './upgrade_select'
import { RestartSelect } from './restart_select'

class DisplayState {
    app: PIXI.Application
    gameState: GameState
    ui: UserInterface
    constructor(app: PIXI.Application, gameState: GameState, ui: UserInterface) {
        this.app = app

        this.gameState = gameState
        this.app.stage.addChild(this.gameState.stage)
        this.ui = ui
        this.app.stage.addChild(this.ui.stage)

        this.update()
    }

    replaceWorld(gameState: GameState) {
        this.app.stage.removeChild(this.gameState.stage)
        this.app.stage.removeChild(this.ui.stage)

        this.gameState = gameState

        this.app.stage.addChild(this.gameState.stage)
        this.app.stage.addChild(this.ui.stage)
    }

    update() {
        // Wow--semicolons are needed
        (this.ui.stage.hitArea as PIXI.Rectangle).width = this.app.renderer.width;
        (this.ui.stage.hitArea as PIXI.Rectangle).height = this.app.renderer.height;

        let topBarHeight = this.ui.topBar.height + 20
        let bottonBarHeight = this.ui.bottomBar.height + 20

        let height = this.app.renderer.height - topBarHeight - bottonBarHeight
        this.ui.topBar.setWidth(height)
        this.ui.bottomBar.setWidth(height)
        let width = Math.max(this.ui.topBar.width, this.ui.bottomBar.width)

        let areaX = (this.app.renderer.width - width) / 2
        let areaY = topBarHeight

        let scale = Math.min(width / this.gameState.width, height / this.gameState.height)
        this.gameState.stage.scale.set(scale, scale)

        let stageX = areaX + (width - scale * this.gameState.width) / 2
        let stageY = areaY

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
    }
}

class UserInterface {
    stage: PIXI.Container
    topBar: TopBar
    bottomBar: StatsBar
    fpsText: PIXI.Text
    upgradeSelect: UpgradeSelect
    restartSelect: RestartSelect
    gameState: GameState

    constructor(gameState: GameState) {
        this.gameState = gameState

        this.stage = new PIXI.Container()
        this.stage.eventMode = "static"
        this.stage.hitArea = new PIXI.Rectangle(0, 0)
        this.stage.on("pointerdown", (event) => {
            this.gameState.spawn = true
        })
        this.fpsText = new PIXI.Text()
        this.fpsText.style.fontFamily = "monospace"
        this.fpsText.style.fill = COLORS["terminal green"]
        this.fpsText.position.set(5, 5)
        this.stage.addChild(this.fpsText)

        this.topBar = new TopBar(this)
        this.bottomBar = new StatsBar(this)

        this.upgradeSelect = new UpgradeSelect(gameState)
        this.gameState.upgradeSelect = this.upgradeSelect
        this.stage.addChild(this.upgradeSelect.box)

        this.restartSelect = new RestartSelect(gameState)
        this.gameState.restartSelect = this.restartSelect
        this.stage.addChild(this.restartSelect.box)
    }

    replaceWorld(gameState: GameState) {
        this.gameState = gameState

        this.topBar.gameState = this.gameState
        this.bottomBar.gameState = this.gameState
        
        this.upgradeSelect.gameState = this.gameState
        this.gameState.upgradeSelect = this.upgradeSelect
        
        this.restartSelect.gameState = this.gameState
        this.gameState.restartSelect = this.restartSelect
    }

    fetch(fps: number, load: number) {
        this.fpsText.text = `${Math.round(fps)} - ${Math.round((load * 100))}%` 

        this.topBar.fetch()
        this.bottomBar.fetch()
    }

    draw() {
        this.topBar.draw()
        this.bottomBar.draw()
    }
}

export {DisplayState, UserInterface}
