import { AppState } from "./app"
import { WORLD_LIST } from "./worlds/worlds"

class ProgressTracker {
    app: AppState
    constructor(app: AppState) {
        this.app = app
    }

    getWorlds() {
        return WORLD_LIST
    }
}

export {ProgressTracker}