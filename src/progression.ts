import { AppState } from "./app"
import { WORLD_LIST, WorldChoice } from "./worlds/worlds"
import { GAME_TITLE, GAME_VERSION } from "./global_consts"
import { HighScores, createHighScores, validateHighScores, castHighScores } from "./progression/hiscore"

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
        let initHighScores = createHighScores()

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
        } else if (!validateHighScores(this.data.highScores)) {
            console.error("Invalid high scores!")
            castHighScores(this.data.highScores)
        } else {
            console.log("Save data looks good!")
            return
        }

        this.writeData()

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
        this.data.lastModified = Date.now()
        localStorage.setItem(SAVE, JSON.stringify(this.data))
    }

    clearData() {
        localStorage.removeItem(SAVE)
    }

    getWorlds() {
        return WORLD_LIST
    }

    getHighScore(id: string) {
        if (id in this.data.highScores) {
            return this.data.highScores[id]
        } else {
            return null
        }
    }

    addHighScore(id: string, level: number) {
        if (id in this.data.highScores && this.data.highScores[id] < level) {
            this.data.highScores[id] = level
            this.writeData()
        }
    }
}

export {ProgressTracker}