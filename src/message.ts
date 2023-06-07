// Unused for now

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
        backSquare.drawRect(3, 3, 44, 44)
        backSquare.endFill()

        let letter = new PIXI.Text(text.charAt(i))
        letter.style.fontFamily = "monospace"
        letter.style.fill = COLORS["terminal green"]
        letter.style.align = "center"
        letter.anchor.set(0.5, 0.5)

        let frontSquare = new PIXI.Graphics()
        frontSquare.beginFill(COLORS["terminal amber"])
        frontSquare.drawRect(2, 2, 46, 46)
        frontSquare.endFill()

        msg.back.push(backSquare)
        msg.text.push(letter)
        msg.front.push(frontSquare)
    }

    return msg
}

export {Message, makeMessage}