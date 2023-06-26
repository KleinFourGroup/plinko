import { AppState } from "./app";
import { RestartEvent } from "./events";

function keydownHandler(event: KeyboardEvent, game: AppState) {
    switch (event.key) {
        case "q":
            game.gameState.enqueueEvent(new RestartEvent())
            break
        case " ":
            game.gameState.spawn = true
            break
        default:
            console.log(`keydown: '${event.key}'`)
    }
}

export {keydownHandler}