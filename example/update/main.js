import { createApp, h, ref } from '../../lib/min-vue.esm.js'

const App = {
    setup() {
        const count = ref(0)

        const add = () => {
            count.value++
        }

        return {
            add,
            count
        }
    },
    render() {
        return h('div', null, [h('p', null, 'count: ' + this.count), h('button', { onClick: this.add }, 'add')])
    }
}

createApp(App).mount('#app')
