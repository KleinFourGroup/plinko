import * as PIXI from 'pixi.js'
import * as Matter from 'matter-js'

// Create the application helper and add its render target to the page
let app = new PIXI.Application({ resizeTo: window, background: '#1099bb' });
// @ts-ignore
document.body.appendChild(app.view);

let intervals: Array<any> = []
let FPS = new PIXI.Text()
FPS.position.set(5, 5)
app.stage.addChild(FPS)

let engine = Matter.Engine.create()
let world = engine.world

let slab = Matter.Bodies.rectangle(300, 300, 500, 25, {isStatic: true})
Matter.World.add(world, slab)

let orb = Matter.Bodies.circle(300, 50, 20, {density: 1})
Matter.World.add(world, orb)

let rect = new PIXI.Graphics()
rect.beginFill(0xFF0000)
rect.drawRect(0, 0, 500, 25)
rect.endFill()
rect.pivot.set(250, 12.5)

let circle = new PIXI.Graphics()
circle.beginFill(0x00FF00)
circle.drawCircle(0, 0, 20)
circle.endFill()

app.stage.addChild(rect)
app.stage.addChild(circle)

// Create the sprite and add it to the stage
let sprite = new PIXI.Text("@") // PIXI.Sprite.from('sample.png');
app.stage.addChild(sprite);

// Add a ticker callback to move the sprite back and forth
let elapsed = 0.0;
app.ticker.add((delta) => {
    console.log(Math.round(delta))
    intervals.push(delta)
    if (intervals.length > 5) intervals.shift()
    FPS.text = Math.round((1000 * intervals.length) / intervals.reduce((a, b) => a + b, 0))

    Matter.Engine.update(engine, 20)

    rect.position.set(slab.position.x, slab.position.y)
    circle.position.set(orb.position.x, orb.position.y)

    elapsed += delta;
    sprite.x = 100.0 + Math.cos(elapsed/50.0) * 100.0;
});