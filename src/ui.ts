import * as PIXI from 'pixi.js'

import { COLORS } from './colors'

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
    zoomStage: PIXI.Container
    gameStage: PIXI.Container
    uiStage: PIXI.Container
    width: number
    height: number
    constructor(app: PIXI.Application, width: number = 1000, height: number = 1000) {
        this.app = app

        this.width = width
        this.height = height
        
        this.zoomStage = new PIXI.Container()
        this.zoomStage.pivot.set(width / 2, height / 2)
        this.app.stage.addChild(this.zoomStage)

        this.gameStage = new PIXI.Container()
        this.zoomStage.addChild(this.gameStage)

        this.uiStage = new PIXI.Container()
        this.zoomStage.addChild(this.uiStage)
    }

    update() {
        this.zoomStage.position.set(this.app.renderer.width / 2, this.app.renderer.height / 2)
        let scale = Math.min(this.app.renderer.width / this.width, this.app.renderer.height / this.height)
        this.zoomStage.scale.set(scale, scale)
    }
}

class UserInterface {
    stage: PIXI.Container
    fpsText: PIXI.Text
    scoreText: PIXI.Text
    message: Message

    constructor(uiStage: PIXI.Container) {
        this.stage = uiStage
        this.fpsText = new PIXI.Text()
        this.fpsText.style.fontFamily = "monospace"
        this.fpsText.style.fill = COLORS["terminal green"]
        this.fpsText.position.set(5, 5)
        this.stage.parent.parent.addChild(this.fpsText)
        
        this.scoreText = new PIXI.Text()
        this.scoreText.style.fontFamily = "monospace"
        this.scoreText.style.fill = COLORS["terminal green"]
        this.scoreText.anchor.set(0, 0.5)
        this.scoreText.position.set(25, 25)
        this.stage.addChild(this.scoreText)
        
        this.message = makeMessage("HAPPYBIRTHDAY")
        for (let i = 0; i < this.message.back.length; i++) {
            this.message.back[i].position.set(200 + 50 * i, 0)
            this.message.text[i].position.set(225 + 50 * i, 25)
            this.message.front[i].position.set(200 + 50 * i, 0)
            this.stage.addChild(this.message.back[i])
            this.stage.addChild(this.message.text[i])
            this.stage.addChild(this.message.front[i])
        }
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
