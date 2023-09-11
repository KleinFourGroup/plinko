import * as PIXI from 'pixi.js'

import { AppMode, AppState } from '../app'
import { makePromptCard, makeWorldCard, drawWorldSelect } from '../cards'

type SelectorCallback = (app: AppState) => void

enum SelectorDirection {
    VERTICAL,
    HORIZONTAL
}

class SelectorBase {
    app: AppState
    choices: Array<PIXI.Container>
    onSelects: Array<SelectorCallback>
    onHighlights: Array<SelectorCallback>
    activeChoice: PIXI.Container
    selector: PIXI.Graphics
    direction: SelectorDirection

    constructor(app: AppState,
        choices: Array<PIXI.Container>,
        onSelects: Array<SelectorCallback>,
        onHighlights: Array<SelectorCallback>,
        direction: SelectorDirection = SelectorDirection.VERTICAL) {
        this.app = app
        this.choices = choices
        this.onSelects = onSelects
        this.onHighlights = onHighlights
        this.activeChoice = null
        this.selector = new PIXI.Graphics()
        this.direction = direction
        // this.highlight(this.choices[0])

        for (let choice of this.choices) {
            choice.on("pointerenter", (event) => {
                event.stopPropagation()
                this.highlight(choice)
            })
            choice.on("pointerdown", (event) => {
                event.stopPropagation()
                // Might be redundant
                this.highlight(choice, false)
                this.select()
            })
        }
    }

    parseInput() {
        if (this.app.inputs.poll("SELECT")) {
            this.app.inputs.reset("SELECT")
            this.select()
        }

        if (this.direction == SelectorDirection.VERTICAL && this.app.inputs.poll("UP")) {
            this.app.inputs.reset("UP")
            this.moveUp()
        }

        if (this.direction == SelectorDirection.VERTICAL && this.app.inputs.poll("DOWN")) {
            this.app.inputs.reset("DOWN")
            this.moveDown()
        }

        if (this.direction == SelectorDirection.HORIZONTAL && this.app.inputs.poll("LEFT")) {
            this.app.inputs.reset("LEFT")
            this.moveUp()
        }

        if (this.direction == SelectorDirection.HORIZONTAL && this.app.inputs.poll("RIGHT")) {
            this.app.inputs.reset("RIGHT")
            this.moveDown()
        }
    }

    highlight(choice: PIXI.Container, playSound: boolean = true) {
        // console.assert(this.choices.indexOf(choice) >= 0)
        if (this.activeChoice !== choice) {
            this.app.soundManager.play("highlight", playSound)
            this.activeChoice = choice
            let index = this.choices.indexOf(this.activeChoice)
            let highlightCallback = this.onHighlights[index];
            if (highlightCallback !== null) highlightCallback(this.app)
        }
        drawWorldSelect(this.selector, choice.x, choice.y, choice.width, choice.height)
    }

    moveUp() {
        let index = this.choices.indexOf(this.activeChoice)
        index = Math.max(index - 1, 0)
        this.highlight(this.choices[index])
    }

    moveDown() {
        let index = this.choices.indexOf(this.activeChoice)
        index = Math.min(index + 1, this.choices.length - 1)
        this.highlight(this.choices[index])
    }

    select() {
        this.app.soundManager.play("select", true)
        let index = this.choices.indexOf(this.activeChoice)
        let selectCallback = this.onSelects[index];
        if (selectCallback !== null) selectCallback(this.app)
    }
}

export {SelectorCallback, SelectorDirection, SelectorBase}