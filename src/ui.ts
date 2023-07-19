import * as PIXI from 'pixi.js'

import { COLORS } from './colors'
import { GameState } from './game_state'
import { TopBar, StatsBar } from './bars'
import { UpgradeSelect } from './selector/select_upgrade'
import { RestartSelect } from './selector/select_restart'

class UserInterface {
    stage: PIXI.Container
    topBar: TopBar
    bottomBar: StatsBar
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

    fetch() {
        this.topBar.fetch()
        this.bottomBar.fetch()
    }

    draw() {
        this.topBar.draw()
        this.bottomBar.draw()
    }
}

export {UserInterface}
