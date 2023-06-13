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
        let topBarHeight = this.ui.topBar.height + 20
        let bottonBarHeight = 0

        let height = this.app.renderer.height - topBarHeight - bottonBarHeight
        this.ui.topBar.setWidth(height)

        let areaX = (this.app.renderer.width - this.ui.topBar.width) / 2
        let areaY = topBarHeight

        let scale = Math.min(this.ui.topBar.width / this.gameState.width, height / this.gameState.height)
        this.gameState.stage.scale.set(scale, scale)

        let stageX = areaX + (this.ui.topBar.width - scale * this.gameState.width) / 2
        let stageY = areaY

        this.gameState.stage.position.set(stageX, stageY)
        this.ui.topBar.stage.position.set((this.app.renderer.width - this.ui.topBar.width) / 2, 0)

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

class TopBar {
    parent: UserInterface
    gameState: GameState
    stage: PIXI.Container
    left: PIXI.Container
    right: PIXI.Container
    width: number
    minWidth: number
    scoreText: PIXI.Text
    levelText: PIXI.Text
    nextText: PIXI.Text
    ballsText: PIXI.Text
    progressBar: ProgressBar

    constructor(parent: UserInterface) {
        this.parent = parent
        this.gameState = this.parent.gameState
        this.stage = new PIXI.Container()
        this.parent.stage.addChild(this.stage)

        this.width = 500
        this.minWidth = 500

        this.left = new PIXI.Container()
        this.left.position.set(0, 10)
        this.right = new PIXI.Container()
        this.right.position.set(this.minWidth, 10)
        this.stage.addChild(this.left)
        this.stage.addChild(this.right)

        this.scoreText = new PIXI.Text()
        this.scoreText.style.fontFamily = "monospace"
        this.scoreText.style.fill = COLORS["terminal green"]
        this.scoreText.anchor.set(0, 0)
        this.scoreText.position.set(0, 0)
        this.left.addChild(this.scoreText)

        this.nextText = new PIXI.Text()
        this.nextText.style.fontFamily = "monospace"
        this.nextText.style.fill = COLORS["terminal green"]
        this.nextText.anchor.set(0, 0)
        this.nextText.position.set(0, this.scoreText.height + 10)
        this.left.addChild(this.nextText)
        
        this.levelText = new PIXI.Text()
        this.levelText.style.fontFamily = "monospace"
        this.levelText.style.fill = COLORS["terminal green"]
        this.levelText.anchor.set(1, 0)
        this.levelText.position.set(0, 0)
        this.right.addChild(this.levelText)
        
        this.ballsText = new PIXI.Text()
        this.ballsText.style.fontFamily = "monospace"
        this.ballsText.style.fill = COLORS["terminal green"]
        this.ballsText.anchor.set(1, 0)
        this.ballsText.position.set(0, this.levelText.height + 10)
        this.right.addChild(this.ballsText)

        this.progressBar = new ProgressBar(this.scoreText.width + 10,
            5,
            this.minWidth - (this.scoreText.width + this.levelText.width + 20),
            40)
        this.stage.addChild(this.progressBar.bar)
    }

    get height() {
        return Math.max(this.left.height, this.right.height)
    }

    setWidth(width: number) {
        this.width = Math.max(width, this.minWidth)
    }

    fetch() {
        let completion = Math.min((this.gameState.levelState.score - this.gameState.levelState.lastTarget) / (this.gameState.levelState.target - this.gameState.levelState.lastTarget), 1)
        
        this.progressBar.update(completion)

        this.scoreText.text = `Score: ${this.gameState.levelState.score}`
        this.nextText.text = `Target: ${this.gameState.levelState.target}`
        this.levelText.text = `Level: ${this.gameState.levelState.level}`
        this.ballsText.text = `Balls: ∞`
    }

    draw() {
        this.right.x = this.width
        this.progressBar.updateBounds(this.left.width + 10,
            (Math.max(this.left.height, this.right.height) - 30) / 2,
            this.right.x - (this.left.width + this.right.width + 20),
            50)
    }
}

class UserInterface {
    stage: PIXI.Container
    topBar: TopBar
    bottomBox: PIXI.Container
    bottomBoxMinWidth: number
    fpsText: PIXI.Text
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

        this.topBar = new TopBar(this)

        this.bottomBox = new PIXI.Container()
        this.bottomBoxMinWidth = 500
        this.stage.addChild(this.bottomBox)
        this.upgradeSelect = new UpgradeSelect(gameState)
        this.stage.addChild(this.upgradeSelect.box)
    }

    fetch(fps: number, load: number) {
        this.fpsText.text = `${Math.round(fps)} - ${Math.round((load * 100))}%` 

        this.topBar.fetch()
    }

    draw() {
        this.topBar.draw()
    }
}

export {DisplayState, UserInterface}
