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

        let textStyle = new PIXI.TextStyle({
            fontFamily: "monospace",
            fill: COLORS["terminal green"]
        })

        this.scoreText = new PIXI.Text("", textStyle)
        this.scoreText.anchor.set(0, 0)
        this.scoreText.position.set(0, 0)
        this.left.addChild(this.scoreText)

        this.nextText = new PIXI.Text("", textStyle)
        this.nextText.anchor.set(0, 0)
        this.nextText.position.set(0, this.scoreText.height + 10)
        this.left.addChild(this.nextText)
        
        this.levelText = new PIXI.Text("", textStyle)
        this.levelText.anchor.set(1, 0)
        this.levelText.position.set(0, 0)
        this.right.addChild(this.levelText)
        
        this.ballsText = new PIXI.Text("", textStyle)
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



class StatsBar {
    parent: UserInterface
    gameState: GameState
    stage: PIXI.Container
    left: PIXI.Container
    middle: PIXI.Container
    right: PIXI.Container
    width: number
    minWidth: number
    speedText: PIXI.Text
    accuracyText: PIXI.Text
    multiText: PIXI.Text
    pegValText: PIXI.Text
    bounceValText: PIXI.Text
    pegCountText: PIXI.Text

    constructor(parent: UserInterface) {
        this.parent = parent
        this.gameState = this.parent.gameState
        this.stage = new PIXI.Container()
        this.parent.stage.addChild(this.stage)

        this.width = 500
        this.minWidth = 500

        this.left = new PIXI.Container()
        this.left.position.set(0, 10)
        this.middle = new PIXI.Container()
        this.middle.position.set(this.width / 2, 10)
        this.right = new PIXI.Container()
        this.right.position.set(this.minWidth, 10)
        this.stage.addChild(this.left)
        this.stage.addChild(this.middle)
        this.stage.addChild(this.right)

        let textStyle = new PIXI.TextStyle({
            fontFamily: "monospace",
            fill: COLORS["terminal green"],
            fontSize: 16
        })

        this.speedText = new PIXI.Text("", textStyle)
        this.speedText.anchor.set(0, 0)
        this.speedText.position.set(0, 0)
        this.left.addChild(this.speedText)

        this.accuracyText = new PIXI.Text("", textStyle)
        this.accuracyText.anchor.set(0, 0)
        this.accuracyText.position.set(0, this.speedText.height + 10)
        this.left.addChild(this.accuracyText)

        this.multiText = new PIXI.Text("", textStyle)
        this.multiText.anchor.set(0, 0)
        this.multiText.position.set(0, this.accuracyText.y + this.accuracyText.height + 10)
        this.left.addChild(this.multiText)
        
        this.pegValText = new PIXI.Text("", textStyle)
        this.pegValText.anchor.set(1, 0)
        this.pegValText.position.set(0, 0)
        this.right.addChild(this.pegValText)
        
        this.bounceValText = new PIXI.Text("", textStyle)
        this.bounceValText.anchor.set(1, 0)
        this.bounceValText.position.set(0, this.pegValText.height + 10)
        this.right.addChild(this.bounceValText)

        this.pegCountText = new PIXI.Text("", textStyle)
        this.pegCountText.anchor.set(1, 0)
        this.pegCountText.position.set(0, this.bounceValText.y + this.bounceValText.height + 10)
        this.right.addChild(this.pegCountText)
    }

    get height() {
        return Math.max(this.left.height, this.right.height)
    }

    setWidth(width: number) {
        this.width = Math.max(width, this.minWidth)
    }

    fetch() {
        this.speedText.text = `Speed: ${this.gameState.spawner.speed}`
        this.accuracyText.text = `Accuracy: ${this.gameState.spawner.accuracy}%`
        this.multiText.text = `Drop Count: ${this.gameState.spawner.dropCount}`
        this.pegValText.text = `Peg Value: ${this.gameState.pegArray.pegValue}`
        this.bounceValText.text = `Bouncer Value: ${this.gameState.pegArray.bouncerValue}`
        this.pegCountText.text = `Pegs/Bouncers: ${this.gameState.pegArray.pegCount}/${this.gameState.pegArray.bouncerCount}`
    }

    draw() {
        this.right.x = this.width
        this.middle.x = this.width / 2
    }
}

class UserInterface {
    stage: PIXI.Container
    topBar: TopBar
    bottomBar: StatsBar
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
        this.bottomBar = new StatsBar(this)

        this.upgradeSelect = new UpgradeSelect(gameState)
        this.stage.addChild(this.upgradeSelect.box)
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
