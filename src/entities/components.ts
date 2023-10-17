
class Component {
    label: string
    constructor(label: string) {
        this.label = label
    }
}

class BouncerComponent extends Component {
    magnitude: number
    constructor(magnitude: number) {
        super("bouncer")
        this.magnitude = magnitude
    }
}

export {Component, BouncerComponent}