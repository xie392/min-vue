import { createApp, h } from '../../lib/min-vue.esm.js'

const App = {
    render() {
        return h('div', null, [
            h('p', null, 'This a App'),
            h(Foo, {
                msg: 'app msg'
            })
        ])
    }
}

const Foo = {
    // 接收 props, emit
    setup(props) {
        console.log('foo setup', props)
        return {}
    },
    render() {
        return h('div', null, [h('p', null, 'This a Foo'), h('p', null, this.msg)])
    }
}

createApp(App).mount('#app')
