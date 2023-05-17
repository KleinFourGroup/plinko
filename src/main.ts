import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

// Create the application helper and add its render target to the page
let app = new PIXI.Application({ resizeTo: window, background: '#1099bb' });

// @ts-ignore
document.body.appendChild(app.view);

type Point = {
    x: number,
    y: number
}

const labelMap: Map<string, PhysicsObject> = new Map<string, PhysicsObject>()
let objCount = 0

type Message = {
    back: Array<PIXI.Graphics>,
    text: Array<PIXI.Text>,
    front: Array<PIXI.Graphics>
}

function makeMessage(text: string): Message {

    let msg: Message = {
        back: [],
        text: [],
        front: []
    }

    for (let i = 0; i < text.length; i++) {
        let backSquare = new PIXI.Graphics()
        backSquare.beginFill(0x00FF00)
        backSquare.drawRect(2, 2, 48, 48)
        backSquare.endFill()

        let letter = new PIXI.Text(text.charAt(i))
        letter.anchor.set(0.5, 0.5)

        let frontSquare = new PIXI.Graphics()
        frontSquare.beginFill(0xFF0000)
        frontSquare.drawRect(2, 2, 48, 48)
        frontSquare.endFill()

        msg.back.push(backSquare)
        msg.text.push(letter)
        msg.front.push(frontSquare)
    }

    return msg
}

class GameState {
    stage: PIXI.Container
    width: number
    height: number
    score: number
    spawnBase: Point
    spawnPoint: Point
    spawnDot: PIXI.Graphics
    walls: Array<BarrierRect | BarrierPoly>
    goals: Array<GoalRect>
    orbs: Array<Orb>
    pegs: Array<Peg>
    scoreText: PIXI.Text
    target: number
    message: Message

    constructor(width: number = 1000, height: number = 1000) {
        this.stage = new PIXI.Container()
        this.stage.pivot.set(width / 2, height / 2)
        this.width = width
        this.height = height
        this.spawnBase = {
            x: width / 2,
            y: 100
        }
        this.spawnPoint = {
            x: width / 2,
            y: 100
        }
        this.walls = []
        this.goals = []
        this.orbs = []
        this.pegs = []

        this.score = 0
        this.target = 500
        this.scoreText = new PIXI.Text(this.score)
        this.scoreText.anchor.set(0, 0.5)
        this.scoreText.position.set(25, 25)
        this.stage.addChild(this.scoreText)

        this.message = makeMessage("HAPPYBIRTHDAY")
        for (let i = 0; i < this.message.back.length; i++) {
            this.message.back[i].position.set(200 + 50 * i, 0)
            this.message.text[i].position.set(225 + 50 * i, 25)
            this.message.front[i].position.set(200 + 50 * i, 0)
            this.stage.addChild(this.message.back[i])
            this.stage.addChild(this.message.text[i])
            this.stage.addChild(this.message.front[i])
        }

        this.spawnDot = new PIXI.Graphics()
        this.spawnDot.beginFill(0x0000F)
        this.spawnDot.drawCircle(0, 0, 5)
        this.spawnDot.endFill()

        this.spawnDot.position.set(this.spawnPoint.x, this.spawnPoint.y)
        this.stage.addChild(this.spawnDot)

        app.stage.addChild(this.stage)
    }
    
    updateGraphics() {
        this.stage.position.set(app.renderer.width / 2, app.renderer.height / 2)
        let scale = Math.min(app.renderer.width / this.width, app.renderer.height / this.height)
        this.stage.scale.set(scale, scale)
        
        this.spawnDot.position.set(this.spawnPoint.x, this.spawnPoint.y)

        let completion = Math.min(this.score / this.target, 1)
        
        for (let i = 0; i < this.message.back.length; i++) {
            this.message.front[i].visible = (i >= Math.floor(this.message.back.length * completion))
        }

        this.scoreText.text = `${this.score}`
        for (let wall of this.walls) {
            wall.update()
        }
        for (let goal of this.goals) {
            goal.update()
        }
        for (let peg of this.pegs) {
            peg.update()
        }
        for (let orb of this.orbs) {
            orb.update()
        }
    }
}

class PhysicsObject {
    world: Matter.World
    body: Matter.Body
    graphics: PIXI.DisplayObject

    constructor(world: Matter.World, body: Matter.Body, graphics: PIXI.DisplayObject) {
        this.world = world

        this.body = body
        this.body.label = "obj" + objCount
        objCount += 1
        Matter.World.addBody(this.world, this.body)

        this.graphics = graphics
        this.graphics.position.set(this.body.position.x, this.body.position.y)
        labelMap.set(this.body.label, this)
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

    removeFrom(parent: PIXI.Container) {
        parent.removeChild(this.graphics)
    }
    
    delete() {
        Matter.World.remove(this.world, this.body)
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
        graphics.beginFill(0xFF0000)
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

    constructor(world: Matter.World, x: number, y: number, width: number, height: number, score: number) {
        let options: Matter.IBodyDefinition = {
            isStatic: true
        }
        let body = Matter.Bodies.rectangle(x, y, width, height, options)

        let graphics = new PIXI.Graphics()
        graphics.beginFill(0x00FF00)
        graphics.drawRect(0, 0, width, height)
        graphics.endFill()
        graphics.pivot.set(width / 2, height / 2)
        let text = new PIXI.Text(`${score}`, new PIXI.TextStyle({fontSize: 20}))
        text.anchor.set(0.5, 0.5)
        text.position.set(0, 0)
        let container = new PIXI.Container()
        container.addChild(graphics)
        container.addChild(text)

        super(world, body, container)
        this.width = width
        this.height = height
        this.score = score
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
        graphics.beginFill(0xFF0000)
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
            restitution: 0.5,
            friction: 0.02
        }
        let body = Matter.Bodies.circle(x, y, radius, options)

        let graphics = new PIXI.Graphics()
        graphics.beginFill(0x00FF00)
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
            isStatic: true
        }
        let body = Matter.Bodies.circle(x, y, radius, options)

        let graphics = new PIXI.Graphics()
        graphics.beginFill(0x0000F)
        graphics.drawCircle(0, 0, radius)
        graphics.endFill()

        super(world, body, graphics)
        this.radius = radius
    }
}

let FPS = new PIXI.Text()

let spawn = false

FPS.position.set(5, 5)
app.stage.addChild(FPS)

let engine = Matter.Engine.create()
let world = engine.world

function initWorld() {
    let rows = 10
    let cols = 17
    let bins = 8
    let wallWidth = 30

    let state: GameState = new GameState()
    
    let goalWidth = (state.width - (bins + 1) * wallWidth) / bins

    let tooth = new Tooth(world, wallWidth / 2, state.height, wallWidth, 20, 40)
    tooth.addTo(state.stage)
    state.walls.push(tooth)

    for (let binNum = 0; binNum < bins; binNum++) {
        let off = wallWidth + binNum * (wallWidth + goalWidth)
        let goal = new GoalRect(world, off + goalWidth / 2, state.height - 10, goalWidth, 20, 2 * Math.abs(binNum - (bins - 1) / 2))
        goal.addTo(state.stage)
        state.goals.push(goal)
        
        let tooth = new Tooth(world, off + goalWidth + wallWidth / 2, state.height, wallWidth, 20, 40)
        tooth.addTo(state.stage)
        state.walls.push(tooth)
    }

    let leftWallVerts = [
        {x: 0, y: state.height - 20},
        {x: wallWidth / 2, y: state.height - 40},
        {x: wallWidth / 4, y: 50 + wallWidth / 4},
        {x: 0, y: 50}
    ]

    let leftWall = new BarrierPoly(world, 0, 0, ...leftWallVerts)
    leftWall.addTo(state.stage)
    state.walls.push(leftWall)

    let rightWallVerts = [
        {x: 0, y: state.height - 20},
        {x: -wallWidth / 2, y: state.height - 40},
        {x: -wallWidth / 4, y: 50 + wallWidth / 4},
        {x: 0, y: 50}
    ]

    let rightWall = new BarrierPoly(world, state.width, 0, ...rightWallVerts)
    rightWall.addTo(state.stage)
    state.walls.push(rightWall)

    let pegWidth = (state.width - 2 * wallWidth) * 0.9  - 10

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (col % 2 == row % 2) {
                let x = (state.width - pegWidth) / 2 + (pegWidth / (cols - 1)) * col
                let y = state.height - 100 - 50 * row
                let peg = new Peg(world, x, y, 5)
                peg.addTo(state.stage)
                state.pegs.push(peg)
            }
        }
    }

    let firstOrb = new Orb(world, state.spawnPoint.x + (2 * Math.random() - 1), state.spawnPoint.y, 15)
    firstOrb.addTo(state.stage)
    state.orbs.push(firstOrb)

    return state
}

let state: GameState = initWorld()

function collisionDispatch(event: Matter.IEventCollision<Matter.Engine>) {
    for (let pair of event.pairs) {
        let objA = labelMap.get(pair.bodyA.label)
        let objB = labelMap.get(pair.bodyB.label)
        if (objA instanceof GoalRect) {
            if (objB instanceof Orb) {
                objB.removeFrom(state.stage)
                labelMap.delete(pair.bodyB.label)
                objB.delete()
                state.orbs.splice(state.orbs.indexOf(objB), 1)
                state.score += objA.score
            }
        }
        if (objB instanceof GoalRect) {
            if (objA instanceof Orb) {
                objA.removeFrom(state.stage)
                labelMap.delete(pair.bodyA.label)
                objA.delete()
                state.orbs.splice(state.orbs.indexOf(objA), 1)
                state.score += objB.score
            }
        }
    }
}

Matter.Events.on(engine, "collisionStart", collisionDispatch)

let intervalsTotal: Array<number> = []
let intervalsWork: Array<number> = []

let lastWork = 0

// Add a ticker callback to move the sprite back and forth
let lastStep = 0
let lastTick = 0
let elapsed = 0.0;

let spawnTot = 0.0

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

    let progress = Math.min(state.score / state.target, 1)

    let off = Math.abs(Math.sin(spawnTot)) * (1 + 1.5 * progress)

    spawnTot += (0.1 + 0.9 * off * off) * 3 * deltaMS / 1000

    state.spawnPoint.x = state.width / 2 + Math.sin(spawnTot) * (state.width - 50) / 2

    if (elapsed - lastStep >= 20) {
        lastStep = Math.floor(elapsed)
        Matter.Engine.update(engine, 20)
    }

    // if (spawn) {
    if (elapsed - lastTick >= 1000 || spawn) {
        spawn = false
        lastTick = Math.floor(elapsed)
        if (state.orbs.length < 15) {
            let newOrb = new Orb(world,  state.spawnPoint.x + (2 * Math.random() - 1), state.spawnPoint.y, 15)
            newOrb.addTo(state.stage)
            state.orbs.push(newOrb)}
    }

    state.updateGraphics()
    
    let endWork = performance.now()

    lastWork = endWork - startWork
}

addEventListener("click", (event) => {spawn = true})
addEventListener("keydown", (event) => {spawn = true})

app.ticker.add(update);