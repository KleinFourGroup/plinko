import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

// Create the application helper and add its render target to the page
let app = new PIXI.Application({ resizeTo: window, background: '#1099bb' });
// @ts-ignore
document.body.appendChild(app.view);

class Orb {
    world: Matter.World
    body: Matter.Body
    graphics: PIXI.Graphics
    radius: number
    x: number
    y: number

    constructor(world: Matter.World, radius: number, x: number, y: number) {
        this.world = world
        this.radius = radius
        this.x = x
        this.y = y

        this.body = Matter.Bodies.circle(x, y, radius)
        Matter.World.addBody(this.world, this.body)

        this.graphics = new PIXI.Graphics()
        this.graphics.beginFill(0x00FF00)
        this.graphics.drawCircle(0, 0, this.radius)
        this.graphics.endFill()

        this.graphics.position.set(this.x, this.y)
    }

    addTo(parent: PIXI.Container) {
        parent.addChild(this.graphics)
    }

    update() {
        this.x = this.body.position.x
        this.y = this.body.position.y
        this.graphics.position.set(this.x, this.y)
    }
}

let FPS = new PIXI.Text()
FPS.position.set(5, 5)
app.stage.addChild(FPS)

let engine = Matter.Engine.create()
let world = engine.world

let slab = Matter.Bodies.rectangle(300, 300, 500, 25, {isStatic: true})
Matter.World.add(world, slab)

let rect = new PIXI.Graphics()
rect.beginFill(0xFF0000)
rect.drawRect(0, 0, 500, 25)
rect.endFill()
rect.pivot.set(250, 12.5)

app.stage.addChild(rect)

let orb = new Orb(world, 20, 300, 50)
orb.addTo(app.stage)

// Create the sprite and add it to the stage
let sprite = new PIXI.Text("@") // PIXI.Sprite.from('sample.png');
app.stage.addChild(sprite)


let intervalsTotal: Array<number> = []
let intervalsWork: Array<number> = []

let lastWork = 0

// Add a ticker callback to move the sprite back and forth
let lastStep = 0
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

    rect.position.set(slab.position.x, slab.position.y)
    orb.update()

    sprite.x = 100.0 + Math.cos(elapsed/50.0) * 100.0;
    
    let endWork = performance.now()

    lastWork = endWork - startWork
}

app.ticker.add(update);