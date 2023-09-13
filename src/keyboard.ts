import { AppState } from "./app";
import keyBindings from "./bindings.json"

class InputHandler {
    bindings: Map<string, string>
    status: Map<string, boolean>
    constructor() {
        this.bindings = new Map<string, string>()
        this.status = new Map<string, boolean>()

        for (const [interaction, key] of Object.entries(keyBindings)) {
            this.bindings.set(interaction, key)
            this.status.set(interaction, false)
        }
    }

    parseKey(key: string) {
        for (let [interaction, binding] of this.bindings) {
            if (binding === key) this.status.set(interaction, true)
        }
    }

    poll(interaction: string) {
        return this.status.get(interaction)
    }

    reset(interaction: string = null) {
        let binding = (interaction !== null) ? this.bindings.get(interaction) : null
        
        for (let interaction of this.status.keys()) {
            if (binding === this.bindings.get(interaction) || binding === null) this.status.set(interaction, false)
        }
    }
}

function keydownHandler(event: KeyboardEvent, game: AppState) {
    game.inputs.parseKey(event.key)
}

export {InputHandler, keydownHandler}