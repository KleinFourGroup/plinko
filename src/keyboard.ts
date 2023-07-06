import { AppState } from "./app";
import { RestartEvent } from "./events";

enum AppInteraction {
    UP,
    DOWN,
    LEFT,
    RIGHT,
    SELECT,
    RESTART,
    MENU,
    SPAWN
}

class InputHandler {
    bindings: Map<AppInteraction, Array<string>>
    status: Map<AppInteraction, boolean>
    constructor() {
        this.bindings = new Map<AppInteraction, Array<string>>()
        this.bindings.set(AppInteraction.UP, ["ArrowUp"])
        this.bindings.set(AppInteraction.DOWN, ["ArrowDown"])
        this.bindings.set(AppInteraction.LEFT, ["ArrowLeft"])
        this.bindings.set(AppInteraction.RIGHT, ["ArrowRight"])
        this.bindings.set(AppInteraction.SELECT, ["Enter"])
        this.bindings.set(AppInteraction.RESTART, ["q"])
        this.bindings.set(AppInteraction.MENU, ["Enter"])
        this.bindings.set(AppInteraction.SPAWN, [" "])
        // There has to be a way to automate this
        this.status = new Map<AppInteraction, boolean>()
        this.status.set(AppInteraction.UP, false)
        this.status.set(AppInteraction.DOWN, false)
        this.status.set(AppInteraction.LEFT, false)
        this.status.set(AppInteraction.RIGHT, false)
        this.status.set(AppInteraction.SELECT, false)
        this.status.set(AppInteraction.RESTART, false)
        this.status.set(AppInteraction.MENU, false)
        this.status.set(AppInteraction.SPAWN, false)
    }

    parseKey(key: string) {
        for (let [interaction, bindings] of this.bindings) {
            if (bindings.indexOf(key) >= 0) this.status.set(interaction, true)
        }
    }

    poll(interaction: AppInteraction) {
        return this.status.get(interaction)
    }

    reset(interaction: AppInteraction = null) {
        if (interaction !== null) {
            this.status.set(interaction, false)
        } else {
            for (let interaction of this.status.keys()) {
                this.status.set(interaction, false)
            }
        }
    }
}

function keydownHandler(event: KeyboardEvent, game: AppState) {
    game.inputs.parseKey(event.key)
}

export {AppInteraction, InputHandler, keydownHandler}