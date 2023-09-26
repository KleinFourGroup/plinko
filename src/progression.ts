import { AppState } from "./app"
import { WORLD_LIST } from "./worlds/worlds"
import { GAME_TITLE, GAME_VERSION } from "./global_consts"
import { HighScores, createHighScores, validateHighScores, castHighScores } from "./save_data"

type SaveData = {
    version: string
    lastModified: number
    highScores: HighScores
}

const SAVE = `${GAME_TITLE} Save Data`

class ProgressTracker {
    app: AppState
    data: SaveData

    constructor(app: AppState) {
        this.app = app
        this.loadData()
        console.log(this.data)
    }

    initData() {
        let initHighScores: HighScores = {}

        for (let world of WORLD_LIST) {
            initHighScores[world.id] = 0
        }

        this.data = {
            version: GAME_VERSION,
            lastModified: Date.now(),
            highScores: initHighScores
        }

        this.writeData()
    }

    validateData() {
        if (this.data.highScores === undefined) {
            console.error("No high scores found!")
            this.data.highScores = createHighScores()
            this.data.lastModified = Date.now()
            this.writeData()
        } else if (!validateHighScores(this.data.highScores)) {
            console.error("Invalid high scores!")
            castHighScores(this.data.highScores)
            this.data.lastModified = Date.now()
            this.writeData()
        } else {
            console.log("Save data looks good!")
        }
    }

    loadData() {
        let saveString = localStorage.getItem(SAVE)
        
        if (saveString !== null) {
            this.data = JSON.parse(saveString) as SaveData;
            this.validateData()
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