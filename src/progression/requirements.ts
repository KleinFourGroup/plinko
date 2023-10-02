import { WORLD_IDS } from '../worlds/worlds'
import levelRequirements from './levels.json'

type HiscoreRequirement = {
    level: string
    hiscore: number
}

type UnlockRequirements = {
    [levelID: string]: Array<HiscoreRequirement>
}

const LEVEL_REQUIREMENTS = (levelRequirements as UnlockRequirements);

function validateRequirements(reqs: UnlockRequirements) {
    for (const id of WORLD_IDS) {
        if (!(id in reqs)) {
            console.error(`ID '${id}' is absent from unlock requirements`)
            return false
        }
    }

    for (const id in reqs) {
        if (WORLD_IDS.indexOf(id) < 0) {
            console.error(`Unrecognized ID '${id}' in unlock requirements`)
            return false
        }
    }

    return true
}

export {UnlockRequirements}
export {LEVEL_REQUIREMENTS}
export {validateRequirements}