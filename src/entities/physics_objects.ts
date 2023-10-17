import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

import { COLORS } from '../colors'
import { Point } from '../point'
import { BouncerComponent, Component } from './components'

const labelMap: Map<string, PhysicsObject> = new Map<string, PhysicsObject>()
let objCount = 0

class PhysicsObject {
    world: Matter.World
    body: Matter.Body
    graphics: PIXI.DisplayObject
    components: Map<string, Component>

    constructor(world: Matter.World, body: Matter.Body, graphics: PIXI.DisplayObject) {
        this.world = world

        this.body = body
        this.body.label = "obj" + objCount
        objCount += 1
        Matter.World.addBody(this.world, this.body)

        this.graphics = graphics
        this.graphics.position.set(this.body.position.x, this.body.position.y)
        labelMap.set(this.body.label, this)

        this.components = new Map<string, Component>()
    }

    get x(): number {
        return  this.body.position.x
    }

    get y(): number {
        return  this.body.position.y
    }

    addTo(parent: PIXI.Container) {
        parent.addChild(this.graphics)
    }

    removeFrom(parent: PIXI.Container, destroy: boolean = true) {
        parent.removeChild(this.graphics)
        if (destroy) this.graphics.destroy()
    }
    
    delete() {
        Matter.World.remove(this.world, this.body)
        labelMap.delete(this.body.label)
    }

    addComponent(comp: Component) {
        if (this.components.has(comp.label)) {
            console.error(`PhysicsObject ${this.body.label} already has a '${comp.label}' component`)
        }

        this.components.set(comp.label, comp)
    }

    hasComponent(label: string) {
        return this.components.has(label)
    }

    getComponent(label: string) {
        if (!this.components.has(label)) {
            console.error(`PhysicsObject ${this.body.label} has no '${label}' component`)
        }

        return this.components.get(label)
    }

    update() {
        this.graphics.position.set(this.body.position.x, this.body.position.y)
    }
}

class BarrierRect extends PhysicsObject {
    width: number
    height: number

    constructor(world: Matter.World, x: number, y: number, width: number, height: number) {
        let options: Matter.IBodyDefinition = {
            isStatic: true
        }
        let body = Matter.Bodies.rectangle(x, y, width, height, options)

        let graphics = new PIXI.Graphics()
        graphics.beginFill(COLORS["terminal amber"])
        graphics.drawRect(0, 0, width, height)
        graphics.endFill()
        graphics.pivot.set(width / 2, height / 2)

        super(world, body, graphics)
        this.width = width
        this.height = height
    }
}

class GoalRect extends PhysicsObject {
    width: number
    height: number
    score: number
    label: PIXI.Text

    constructor(world: Matter.World, x: number, y: number, width: number, height: number, score: number) {
        let options: Matter.IBodyDefinition = {
            isStatic: true
        }
        let body = Matter.Bodies.rectangle(x, y, width, height, options)

        let graphics = new PIXI.Graphics()
        graphics.lineStyle(2, COLORS["terminal green"])
        graphics.beginFill(COLORS["dark terminal green"])
        graphics.drawRect(0, 0, width, height)
        graphics.endFill()
        graphics.pivot.set(width / 2, height / 2)
        let text = new PIXI.Text(`${score}`, new PIXI.TextStyle({fontSize: 20}))
        text.style.fontFamily = "monospace"
        text.style.fill = COLORS["terminal green"]
        text.anchor.set(0.5, 0.5)
        text.position.set(0, 0)
        let container = new PIXI.Container()
        container.addChild(graphics)
        container.addChild(text)

        super(world, body, container)
        this.width = width
        this.height = height
        this.score = score
        this.label = text
    }

    update() {
        this.graphics.position.set(this.body.position.x, this.body.position.y)
        this.label.text = `${this.score}`
    }
}

class HiddenBoundary extends PhysicsObject {
    width: number
    height: number

    constructor(world: Matter.World, x: number, y: number, width: number, height: number) {
        let options: Matter.IBodyDefinition = {
            isStatic: true
        }
        let body = Matter.Bodies.rectangle(x, y, width, height, options)

        let graphics = new PIXI.Graphics()
        graphics.pivot.set(width / 2, height / 2)

        super(world, body, graphics)
        this.width = width
        this.height = height
    }

    show() {
        let graphics = this.graphics as PIXI.Graphics
        graphics.clear()
        graphics.beginFill(COLORS["dark neon red"])
        graphics.drawRect(0, 0, this.width, this.height)
        graphics.endFill()
    }

    hide() {
        let graphics = this.graphics as PIXI.Graphics
        graphics.clear()
    }
}

class BarrierPoly extends PhysicsObject {
    points: Array<Point>

    constructor(world: Matter.World, x: number, y: number, ...points: Array<Point>) {
        let options: Matter.IBodyDefinition = {
            isStatic: true
        }
        let body = Matter.Bodies.fromVertices(x, y, [points], options)

        let minBound = {x: Infinity, y: Infinity}

        let flatPoints: Array<number> = []
        for (let point of points) {
            minBound.x = Math.min(minBound.x, point.x)
            minBound.y = Math.min(minBound.y, point.y)
            flatPoints.push(point.x, point.y)
        }
        let center = {
            x: minBound.x + body.position.x - body.bounds.min.x,
            y: minBound.y + body.position.y - body.bounds.min.y
        }

        Matter.Body.setPosition(body, {x: body.position.x + center.x, y: body.position.y + center.y})

        let graphics = new PIXI.Graphics()
        graphics.beginFill(COLORS["terminal amber"])
        graphics.drawPolygon(...flatPoints)
        graphics.endFill()
        graphics.pivot.set(center.x, center.y)

        super(world, body, graphics)
        this.points = points
    }
}

class Tooth extends BarrierPoly {
    constructor(world: Matter.World, x: number, y: number, width: number, baseHeight: number, maxHeight: number) {
        let points = [
            {x: -width / 2, y: 0},
            {x: -width / 2, y: -baseHeight},
            {x: 0, y: -maxHeight},
            {x: width / 2, y: -baseHeight},
            {x: width / 2, y: 0}
        ]
        super(world, x, y, ...points)
    }
}

class Orb extends PhysicsObject {
    radius: number

    constructor(world: Matter.World, x: number, y: number, radius: number) {
        let options: Matter.IBodyDefinition = {
            restitution: 0.55,
            friction: 0.02,
            mass: 0.1
        }
        let body = Matter.Bodies.circle(x, y, radius, options)

        let graphics = new PIXI.Graphics()
        graphics.beginFill(COLORS["terminal green"])
        graphics.drawCircle(0, 0, radius)
        graphics.endFill()

        super(world, body, graphics)
        this.radius = radius
    }
}

class Peg extends PhysicsObject {
    radius: number

    constructor(world: Matter.World, x: number, y: number, radius: number) {
        let options: Matter.IBodyDefinition = {
            isStatic: true,
            restitution: 0.5,
            mass: 1
        }
        let body = Matter.Bodies.circle(x, y, radius, options)

        let graphics = new PIXI.Graphics()
        graphics.beginFill(COLORS["terminal amber"])
        graphics.drawCircle(0, 0, radius)
        graphics.endFill()

        super(world, body, graphics)
        this.radius = radius
    }
}

class Bouncer extends PhysicsObject {
    radius: number

    constructor(world: Matter.World, x: number, y: number, radius: number) {
        let options: Matter.IBodyDefinition = {
            isStatic: true,
            restitution: 0.5,
            mass: 1
        }
        let body = Matter.Bodies.circle(x, y, radius, options)

        let graphics = new PIXI.Graphics()
        graphics.beginFill(COLORS["neon red"])
        graphics.drawCircle(0, 0, radius)
        graphics.endFill()

        super(world, body, graphics)
        this.radius = radius

        this.addComponent(new BouncerComponent(10))
    }
}

export {labelMap}
export {PhysicsObject, BarrierRect, BarrierPoly, HiddenBoundary, Tooth, GoalRect, Orb, Peg, Bouncer}