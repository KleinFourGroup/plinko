import * as PIXI from 'pixi.js'

import { COLORS } from './colors'
import { GameState } from './game_state'

type Message = {
    back: Array<PIXI.Graphics>,
    text: Array<PIXI.Text>,
    front: Array<PIXI.Graphics>
}

function makeMessage(text: string): Message {

    let msg: Message = {
        back: [],
        text: [],
        front: []
    }

    for (let i = 0; i < text.length; i++) {
        let backSquare = new PIXI.Graphics()
        backSquare.lineStyle(2, COLORS["terminal amber"])
        backSquare.beginFill(COLORS["dark terminal green"])
        backSquare.drawRect(5, 5, 45, 45)
        backSquare.endFill()

        let letter = new PIXI.Text(text.charAt(i))
        letter.style.fontFamily = "monospace"
        letter.style.fill = COLORS["terminal green"]
        letter.style.align = "center"
        letter.anchor.set(0.5, 0.5)

        let frontSquare = new PIXI.Graphics()
        frontSquare.beginFill(COLORS["terminal amber"])
        frontSquare.drawRect(2, 2, 48, 48)
        frontSquare.endFill()

        msg.back.push(backSquare)
        msg.text.push(letter)
        msg.front.push(frontSquare)
    }

    return msg
}

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
        let topBarHeight = 50
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
        this.ui.topBox.position.set((this.app.renderer.width - this.ui.topBoxWidth) / 2, 0)
    }
}

class UserInterface {
    stage: PIXI.Container
    topBox: PIXI.Container
    topBoxWidth: number
    fpsText: PIXI.Text
    scoreText: PIXI.Text
    message: Message

    constructor() {
        this.stage = new PIXI.Container()
        this.fpsText = new PIXI.Text()
        this.fpsText.style.fontFamily = "monospace"
        this.fpsText.style.fill = COLORS["terminal green"]
        this.fpsText.position.set(5, 5)
        this.stage.addChild(this.fpsText)
       
        
        this.topBox = new PIXI.Container()
        this.stage.addChild(this.topBox)
        this.scoreText = new PIXI.Text()
        this.scoreText.style.fontFamily = "monospace"
        this.scoreText.style.fill = COLORS["terminal green"]
        this.scoreText.anchor.set(0, 0.5)
        this.scoreText.position.set(25, 25)
        this.topBox.addChild(this.scoreText)
        
        this.message = makeMessage("HAPPYBIRTHDAY")
        for (let i = 0; i < this.message.back.length; i++) {
            this.message.back[i].position.set(200 + 50 * i, 0)
            this.message.text[i].position.set(225 + 50 * i, 25)
            this.message.front[i].position.set(200 + 50 * i, 0)
            this.topBox.addChild(this.message.back[i])
            this.topBox.addChild(this.message.text[i])
            this.topBox.addChild(this.message.front[i])
        }

        this.topBoxWidth = 200 + 50 * this.message.back.length
    }

    update(fps: number, load: number, score: number, target: number) {
        this.fpsText.text = `${Math.round(fps)} - ${Math.round((load * 100))}%` 

        let completion = Math.min(score / target, 1)
        
        for (let i = 0; i < this.message.back.length; i++) {
            this.message.front[i].visible = (i >= Math.floor(this.message.back.length * completion))
        }

        this.scoreText.text = `${score}`
        
    }
}

export {DisplayState, UserInterface}
