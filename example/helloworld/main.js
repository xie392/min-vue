import { createApp, h } from '../../lib/min-vue.esm.js'

const App = {
    setup() {
        return {
            msg: 'This is a App msg'
        }
    },
    render() {
        const div = h('div', null, [h('p', null, 'This a App'), h('p', { id: 'msg' }, this.msg)])
        const btn = h(
            'button',
            {
                id: 'btn',
                onClick: () => {
                    console.log('btn click')
                }
            },
            'Click me'
        )

        return h('div', null, [div, btn])
    }
}

createApp(App).mount('#app')
