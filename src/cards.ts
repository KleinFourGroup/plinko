import * as PIXI from 'pixi.js'

import { COLORS } from './colors'

let titleStyle = new PIXI.TextStyle({
    wordWrap: true,
    wordWrapWidth: 400,
    fontFamily: "monospace",
    fill: COLORS["terminal green"]
})

let descStyle = new PIXI.TextStyle({
    wordWrap: true,
    wordWrapWidth: 400,
    fontFamily: "monospace",
    fill: COLORS["terminal green"],
    fontSize: 20
})

let promptStyle = new PIXI.TextStyle({
    wordWrap: true,
    wordWrapWidth: 400,
    fontFamily: "monospace",
    fill: COLORS["terminal amber"]
})

const MARGIN = 10
let width = 400 + 2 * MARGIN

function makeSimpleCard(text: string) {
    let displayText = new PIXI.Text(text, titleStyle)

    let height = displayText.height + 2 * MARGIN

    let backBox = new PIXI.Graphics()
    // backBox.lineStyle(3, COLORS["terminal green"])
    backBox.beginFill(COLORS["dark terminal green"])
    backBox.drawRect(0, 0, width, height)
    backBox.endFill()

    let card = new PIXI.Container()
    card.addChild(backBox)
    displayText.position.set(MARGIN, MARGIN)
    card.addChild(displayText)

    card.eventMode = 'static'

    return card
}

function makeUpgradeCard(title: string, description: string) {
    let titleText = new PIXI.Text(title, titleStyle)
    let descriptionText = new PIXI.Text(description, descStyle)

    let height = titleText.height + descriptionText.height + 3 * MARGIN

    let backBox = new PIXI.Graphics()

    // backBox.lineStyle(3, COLORS["terminal green"])
    backBox.beginFill(COLORS["dark terminal green"])
    backBox.drawRect(0, 0, width, height)
    backBox.endFill()

    let card = new PIXI.Container()
    card.addChild(backBox)
    card.addChild(titleText)
    titleText.position.set(MARGIN, MARGIN)
    card.addChild(descriptionText)
    descriptionText.position.set(MARGIN, titleText.height + 2 * MARGIN)
    card.eventMode = "static"

    return card
}

function makePromptCard(text: string) {
    let displayText = new PIXI.Text(text, promptStyle)

    let height = displayText.height + 2 * MARGIN

    let backBox = new PIXI.Graphics()
    backBox.lineStyle(3, COLORS["terminal amber"])
    backBox.beginFill(COLORS["dark terminal amber"])
    backBox.drawRect(0, 0, width, height)
    backBox.endFill()

    let card = new PIXI.Container()
    card.addChild(backBox)
    displayText.position.set(MARGIN, MARGIN)
    card.addChild(displayText)

    card.eventMode = 'static'

    return card
}

function makeWorldCard(text: string) {
    let displayText = new PIXI.Text(text, titleStyle)

    let height = displayText.height + 2 * MARGIN

    let backBox = new PIXI.Graphics()
    backBox.beginFill(COLORS["dark terminal green"])
    backBox.drawRect(0, 0, width, height)
    backBox.endFill()

    let card = new PIXI.Container()
    card.addChild(backBox)
    displayText.position.set(MARGIN, MARGIN)
    card.addChild(displayText)

    card.eventMode = 'static'

    return card
}

function drawWorldSelect(select: PIXI.Graphics, x: number, y: number, width: number, height: number) {
    select.clear()
    select.lineStyle(3, COLORS["terminal green"])
    select.drawRect(x, y, width, height)
    // select.endFill()
}

export {MARGIN}
export {makeSimpleCard, makeUpgradeCard, makePromptCard, makeWorldCard, drawWorldSelect}