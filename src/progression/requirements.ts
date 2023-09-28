import { AppState } from "../app"
import { WORLD_IDS, WORLD_LIST } from "../worlds/worlds"
import { GAME_TITLE, GAME_VERSION } from "../global_consts"

type HiscoreRequirement = {
    id: string
    levelMax: number
}

type UnlockRequirements = Array<HiscoreRequirement>