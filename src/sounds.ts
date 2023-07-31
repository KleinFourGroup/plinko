import {Howl, Howler} from 'howler'

class SoundManager {
    sounds: Map<string, Howl>

    constructor() {
        this.sounds = new Map<string, Howl>()
        this.sounds.set("peghit", 
            new Howl({
                src: ["../sounds/170141__timgormly__8-bit-bump.mp3"]
            })
        )
    }

    play(soundName: string) {
        let sound = this.sounds.get(soundName)
        sound.play()
    }
}

export {SoundManager}