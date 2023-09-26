import { AppState } from "./app"
import { WORLD_IDS, WORLD_LIST } from "./worlds/worlds"
import { GAME_TITLE, GAME_VERSION } from "./global_consts"

type HighScores = {
    [levelID: string]: number
}

function createHighScores() {
    let initHighScores: HighScores = {}

    for (const world of WORLD_LIST) {
        initHighScores[world.id] = 0
    }

    return initHighScores
}

function validateHighScores(highScores: HighScores) {
    for (const id of WORLD_IDS) {
        if (!(id in highScores)) return false
    }

    for (const id in highScores) {
        if (WORLD_IDS.indexOf(id) < 0) return false
    }

    return true
}

function castHighScores(highScores: HighScores) {
    for (const id of WORLD_IDS) {
        if (!(id in highScores)) highScores[id] = 0
    }

    for (const id in highScores) {
        if (WORLD_IDS.indexOf(id) < 0) delete highScores[id]
    }

    return true
}

export {HighScores}
export {createHighScores, validateHighScores, castHighScores}