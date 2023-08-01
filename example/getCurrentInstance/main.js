import { createApp, h, getCurrentInstance } from '../../lib/min-vue.esm.js'

const App = {
    setup() {
        const instance = getCurrentInstance()
        console.log(instance)
    },
    render() {
        return h('div', null, 'Hello World')
    }
}

createApp(App).mount('#app')
