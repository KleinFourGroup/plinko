import {Howl, Howler} from 'howler'
import soundData from './sounds.json'

class SoundManager {
    sounds: Map<string, Howl>

    constructor() {
        this.sounds = new Map<string, Howl>()
        for (const [name, sound] of Object.entries(soundData)) {
            this.sounds.set(name,
                new Howl({
                    src: [sound.src],
                    volume: sound.volume
                }))
        }
    }

    play(soundName: string, playSound: boolean = true) {
        let sound = this.sounds.get(soundName)
        if (playSound) sound.play()
    }
}

export {SoundManager}