import { createApp, h } from '../../lib/min-vue.esm.js'

const App = {
    render() {
        return h('div', null, Foo)
    }
}

const Foo = {
    render() {
        return h('div', null, h('p', null, 'This a Foo'))
    }
}

createApp(App).mount('#app')
