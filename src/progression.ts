import { AppState } from "./app"
import { WORLD_LIST } from "./worlds/worlds"
import { GAME_TITLE, GAME_VERSION } from "./global_consts"

type SaveData = {
    version: string
    lastModified: number
}

const SAVE = `${GAME_TITLE} Save Data`

class ProgressTracker {
    app: AppState
    data: SaveData

    constructor(app: AppState) {
        this.app = app
        this.loadData()
        // console.log(this.data)
    }

    initData() {
        this.data = {
            version: GAME_VERSION,
            lastModified: Date.now()
        }

        this.writeData()
    }

    loadData() {
        let saveString = localStorage.getItem(SAVE)
        
        if (saveString !== null) {
            this.data = JSON.parse(saveString) as SaveData;
        } else {
            this.initData()
        }
    }

    writeData() {
        localStorage.setItem(SAVE, JSON.stringify(this.data))
    }

    clearData() {
        localStorage.removeItem(SAVE)
    }

    getWorlds() {
        return WORLD_LIST
    }
}

export {ProgressTracker}