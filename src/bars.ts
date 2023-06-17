import * as PIXI from 'pixi.js'

import { COLORS } from './colors'
import { GameState } from './game_state'
import { UserInterface } from './ui'

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

export {ProgressBar, TopBar, StatsBar}