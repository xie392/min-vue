import { createReander, h } from '../../lib/min-vue.esm.js'

let app = new PIXI.Application({ width: 640, height: 360 })

document.body.appendChild(app.view)

const App = {
    setup() {
        return {
            x: 50,
            y: 50
        }
    },
    render() {
        return h(
            'rect',
            {
                x: this.x,
                y: this.y
            },
            null
        )
    }
}

const render = createReander({
    createElement(type) {
        if (type === 'rect') {
            const rect = new PIXI.Graphics()
            rect.beginFill(0xff0000)
            rect.drawRect(0, 0, 100, 100)
            rect.endFill()
            return rect
        }
    },
    patchProps(el, key, val) {
        el[key] = val
    },
    insert(el, parent) {
        parent.addChild(el)
    }
})

render.createApp(App).mount(app.stage)
