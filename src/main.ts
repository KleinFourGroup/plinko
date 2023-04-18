import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

// Create the application helper and add its render target to the page
let app = new PIXI.Application({ resizeTo: window, background: '#1099bb' });
// @ts-ignore
document.body.appendChild(app.view);

class PhysicsObject {
    world: Matter.World
    body: Matter.Body
    graphics: PIXI.Graphics

    constructor(world: Matter.World, body: Matter.Body, graphics: PIXI.Graphics) {
        this.world = world

        this.body = body
        Matter.World.addBody(this.world, this.body)

        this.graphics = graphics
        this.graphics.position.set(this.body.position.x, this.body.position.y)
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

    update() {
        this.graphics.position.set(this.body.position.x, this.body.position.y)
    }
}

class Barrier extends PhysicsObject {
    width: number
    height: number

    constructor(world: Matter.World, x: number, y: number, width: number, height: number) {
        let body = Matter.Bodies.rectangle(x, y, width, height, {isStatic: true})

        let graphics = new PIXI.Graphics()
        graphics.beginFill(0xFF0000)
        graphics.drawRect(0, 0, width, height)
        graphics.endFill()
        graphics.pivot.set(width / 2, height / 2)

        super(world, body, graphics)
        this.width = width
        this.height = height
    }
}

class Orb extends PhysicsObject {
    radius: number

    constructor(world: Matter.World, x: number, y: number, radius: number) {
        let body = Matter.Bodies.circle(x, y, radius)

        let graphics = new PIXI.Graphics()
        graphics.beginFill(0x00FF00)
        graphics.drawCircle(0, 0, radius)
        graphics.endFill()

        super(world, body, graphics)
        this.radius = radius
    }
}

let FPS = new PIXI.Text()
FPS.position.set(5, 5)
app.stage.addChild(FPS)

let engine = Matter.Engine.create()
let world = engine.world

let slab = new Barrier(world, 300, 450, 500, 25)
slab.addTo(app.stage)

let orbs: Array<Orb> = []

let firstOrb = new Orb(world, 300, 50, 20)
firstOrb.addTo(app.stage)
orbs.push(firstOrb)

let intervalsTotal: Array<number> = []
let intervalsWork: Array<number> = []

let lastWork = 0

// Add a ticker callback to move the sprite back and forth
let lastStep = 0
let lastTick = 0
let elapsed = 0.0;

// delta is in frames, not ms =()
function update(delta: number) {
    let deltaMS: number = app.ticker.deltaMS

    intervalsTotal.push(deltaMS)
    intervalsWork.push(lastWork)

    if (intervalsTotal.length > 20) {
        intervalsTotal.shift()
        intervalsWork.shift()
    }

    FPS.text = `${Math.round(app.ticker.FPS)} - ${Math.round((intervalsWork.reduce((a, b) => a + b, 0) / intervalsTotal.reduce((a, b) => a + b, 0) * 100))}%` 
    
    elapsed += deltaMS;

    let startWork = performance.now()

    if (elapsed - lastStep >= 20) {
        lastStep = Math.floor(elapsed)
        Matter.Engine.update(engine, 20)
    }

    if (elapsed - lastTick >= 1000) {
        lastTick = Math.floor(elapsed)
        if (orbs.length < 10) {
            let newOrb = new Orb(world, 300, 50, 20)
            newOrb.addTo(app.stage)
            orbs.push(newOrb)}
    }

    slab.update()
    for (let orb of orbs) {
        orb.update()
    }
    
    let endWork = performance.now()

    lastWork = endWork - startWork
}

app.ticker.add(update);