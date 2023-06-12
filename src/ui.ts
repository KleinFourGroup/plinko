import * as PIXI from 'pixi.js'

import { COLORS } from './colors'
import { GameState } from './game_state'
import { UpgradeSelect } from './upgrade_select'

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

    update() {
        let topBarHeight = Math.max(this.ui.topLeft.height, this.ui.topRight.height) + 20
        let bottonBarHeight = 0

        let height = this.app.renderer.height - topBarHeight - bottonBarHeight
        let width = Math.max(height, this.ui.topBoxWidth)

        let areaX = (this.app.renderer.width - width) / 2
        let areaY = topBarHeight

        let scale = Math.min(width / this.gameState.width, height / this.gameState.height)
        this.gameState.stage.scale.set(scale, scale)

        let stageX = areaX + (width - scale * this.gameState.width) / 2
        let stageY = areaY

        this.gameState.stage.position.set(stageX, stageY)
        this.ui.topBox.position.set((this.app.renderer.width - width) / 2, 0)
        this.ui.topRight.x = width

        this.ui.upgradeSelect.box.position.set(
            (this.app.renderer.width - this.ui.upgradeSelect.box.width) / 2,
            (this.app.renderer.height - this.ui.upgradeSelect.box.height) / 2
        )
    }
}

class ProgressBar {
    bar: PIXI.Container
    foreBar: PIXI.Graphics
    backBar: PIXI.Graphics
    progress: number
    x: number
    y: number
    width: number
    height: number

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height

        this.bar = new PIXI.Container()

        this.foreBar = new PIXI.Graphics()
        this.foreBar.beginFill(COLORS["flourescent blue"])
        this.foreBar.drawRect(0, 0, this.width, this.height)
        this.foreBar.endFill()
        this.foreBar.pivot.set(0, 0)

        this.backBar = new PIXI.Graphics()
        this.backBar.beginFill(COLORS["dark flourescent blue"])
        this.backBar.drawRect(0, 0, this.width, this.height)
        this.backBar.endFill()
        this.backBar.position.set(0, 0)

        this.bar.addChild(this.backBar)
        this.bar.addChild(this.foreBar)
        this.foreBar.width = 0

        this.bar.position.set(this.x, this.y)

        this.progress = 0
    }

    updateBounds(x: number, y: number, width: number, height: number) {
        if (this.x !== x || this.y !== y) {
            this.x = x
            this.y = y

            this.bar.position.set(this.x, this.y)
        }

        if (this.width !== width || this.height !== height) {
            this.width = width
            this.height = height
    
            this.foreBar.clear()
            this.foreBar.beginFill(COLORS["flourescent blue"])
            this.foreBar.drawRect(0, 0, this.width, this.height)
            this.foreBar.endFill()
            this.foreBar.pivot.set(0, 0)
    
            this.backBar.clear()
            this.backBar.beginFill(COLORS["dark flourescent blue"])
            this.backBar.drawRect(0, 0, this.width, this.height)
            this.backBar.endFill()
            this.backBar.position.set(0, 0)

            this.foreBar.width = this.progress * this.width
        }
    }

    update(progress: number) {
        this.progress = progress
        this.foreBar.width = this.progress * this.width
    }
}

class UserInterface {
    stage: PIXI.Container
    topBox: PIXI.Container
    topLeft: PIXI.Container
    topRight: PIXI.Container
    topBoxWidth: number
    fpsText: PIXI.Text
    scoreText: PIXI.Text
    levelText: PIXI.Text
    nextText: PIXI.Text
    speedText: PIXI.Text
    progressBar: ProgressBar
    upgradeSelect: UpgradeSelect
    gameState: GameState

    constructor(gameState: GameState) {
        this.gameState = gameState

        this.stage = new PIXI.Container()
        this.fpsText = new PIXI.Text()
        this.fpsText.style.fontFamily = "monospace"
        this.fpsText.style.fill = COLORS["terminal green"]
        this.fpsText.position.set(5, 5)
        this.stage.addChild(this.fpsText)
       
        
        this.topBox = new PIXI.Container()
        this.topBoxWidth = 500
        this.stage.addChild(this.topBox)

        this.topLeft = new PIXI.Container()
        this.topLeft.position.set(0, 10)
        this.topRight = new PIXI.Container()
        this.topRight.position.set(this.topBoxWidth, 10)
        this.topBox.addChild(this.topLeft)
        this.topBox.addChild(this.topRight)

        this.scoreText = new PIXI.Text()
        this.scoreText.style.fontFamily = "monospace"
        this.scoreText.style.fill = COLORS["terminal green"]
        this.scoreText.anchor.set(0, 0)
        this.scoreText.position.set(0, 0)
        this.topLeft.addChild(this.scoreText)

        this.nextText = new PIXI.Text()
        this.nextText.style.fontFamily = "monospace"
        this.nextText.style.fill = COLORS["terminal green"]
        this.nextText.anchor.set(0, 0)
        this.nextText.position.set(0, this.scoreText.height + 10)
        this.topLeft.addChild(this.nextText)
        
        this.levelText = new PIXI.Text()
        this.levelText.style.fontFamily = "monospace"
        this.levelText.style.fill = COLORS["terminal green"]
        this.levelText.anchor.set(1, 0)
        this.levelText.position.set(0, 0)
        this.topRight.addChild(this.levelText)
        
        this.speedText = new PIXI.Text()
        this.speedText.style.fontFamily = "monospace"
        this.speedText.style.fill = COLORS["terminal green"]
        this.speedText.anchor.set(1, 0)
        this.speedText.position.set(0, this.levelText.height + 10)
        this.topRight.addChild(this.speedText)

        this.progressBar = new ProgressBar(this.scoreText.width + 10,
            5,
            this.topBoxWidth - (this.scoreText.width + this.levelText.width + 20),
            40)
        this.topBox.addChild(this.progressBar.bar)

        this.upgradeSelect = new UpgradeSelect(gameState)
        this.stage.addChild(this.upgradeSelect.box)
    }

    update(fps: number, load: number) {
        this.fpsText.text = `${Math.round(fps)} - ${Math.round((load * 100))}%` 

        let completion = Math.min((this.gameState.levelState.score - this.gameState.levelState.lastTarget) / (this.gameState.levelState.target - this.gameState.levelState.lastTarget), 1)
        
        this.progressBar.update(completion)

        this.scoreText.text = `Score: ${this.gameState.levelState.score}`
        this.nextText.text = `Target: ${this.gameState.levelState.target}`
        this.levelText.text = `Level: ${this.gameState.levelState.level}`
        this.speedText.text = `Speed: ${this.gameState.spawner.speed}`
        
        this.progressBar.updateBounds(this.topLeft.width + 10,
            (Math.max(this.topLeft.height, this.topRight.height) - 30) / 2,
            this.topRight.x - (this.topLeft.width + this.topRight.width + 20),
            50)
    }
}

export {DisplayState, UserInterface}
