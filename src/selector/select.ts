import * as PIXI from 'pixi.js'

import { AppMode, AppState } from '../app'
import { makePromptCard, makeWorldCard, drawWorldSelect } from '../cards'
import { GameMenu } from '../menu'
import { AppInteraction } from '../keyboard'

type SelectorCallback = (app: AppState) => void

class SelectorBase {
    app: AppState
    choices: Array<PIXI.Container>
    onSelects: Array<SelectorCallback>
    onHighlights: Array<SelectorCallback>
    activeChoice: PIXI.Container
    selector: PIXI.Graphics

    constructor(app: AppState, choices: Array<PIXI.Container>, onSelects: Array<SelectorCallback>, onHighlights: Array<SelectorCallback>) {
        this.app = app
        this.choices = choices
        this.onSelects = onSelects
        this.onHighlights = onHighlights
        this.activeChoice = null
        this.selector = new PIXI.Graphics()
        // this.highlight(this.choices[0])

        for (let choice of this.choices) {
            choice.on("pointerenter", (event) => {
                event.stopPropagation()
                this.highlight(choice)
            })
            choice.on("pointerdown", (event) => {
                event.stopPropagation()
                // Might be redundant
                this.highlight(choice)
                this.select()
            })
        }
    }

    parseInput() {
        if (this.app.inputs.poll(AppInteraction.SELECT)) {
            this.app.inputs.reset(AppInteraction.SELECT)
            this.app.inputs.reset(AppInteraction.MENU) // Hacky
            this.select()
        }

        if (this.app.inputs.poll(AppInteraction.UP)) {
            this.app.inputs.reset(AppInteraction.UP)
            this.moveUp()
        }

        if (this.app.inputs.poll(AppInteraction.DOWN)) {
            this.app.inputs.reset(AppInteraction.DOWN)
            this.moveDown()
        }
    }

    highlight(choice: PIXI.Container) {
        // console.assert(this.choices.indexOf(choice) >= 0)
        if (this.activeChoice !== choice) {
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
        let index = this.choices.indexOf(this.activeChoice)
        let selectCallback = this.onSelects[index];
        selectCallback(this.app)
    }
}

export {SelectorCallback, SelectorBase}