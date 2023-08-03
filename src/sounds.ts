import {Howl, Howler} from 'howler'

class SoundManager {
    sounds: Map<string, Howl>

    constructor() {
        this.sounds = new Map<string, Howl>()
        this.sounds.set("score", 
            new Howl({
                src: ["../sounds/109662__grunz__success.wav"]
            })
        )
        this.sounds.set("peghit", 
            new Howl({
                src: ["../sounds/495650__matrixxx__short-ping-or-short-notification.wav"]
            })
        )
        this.sounds.set("bouncerhit", 
            new Howl({
                src: ["../sounds/170141__timgormly__8-bit-bump.mp3"]
            })
        )
        this.sounds.set("mischit", 
            new Howl({
                src: ["../sounds/215162__otisjames__thud.wav"]
            })
        )
        this.sounds.set("levelup", 
            new Howl({
                src: ["../sounds/528958__beetlemuse__level-up-mission-complete.wav"]
            })
        )
        this.sounds.set("highlight", 
            new Howl({
                src: ["../sounds/657948__matrixxx__family-friendly-inspect-sound-ui-or-in-game-notification.wav"]
            })
        )
        this.sounds.set("select", 
            new Howl({
                src: ["../sounds/657945__matrixxx__scifi-inspect-sound-ui-or-in-game-notification-01.wav"]
            })
        )
        this.sounds.set("gameover", 
            new Howl({
                src: ["../sounds/350986__cabled_mess__lose_c_01.wav"]
            })
        )
        this.sounds.set("error", 
            new Howl({
                src: ["../sounds/423166__plasterbrain__minimalist-sci-fi-ui-error.mp3"]
            })
        )
    }

    play(soundName: string, playSound: boolean = true) {
        let sound = this.sounds.get(soundName)
        if (playSound) sound.play()
    }
}

export {SoundManager}