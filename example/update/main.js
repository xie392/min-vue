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
        const foo = h(Foo, { foo: this.count }, null)
        return h('div', null, [h('p', null, 'count: ' + this.count), h('button', { onClick: this.add }, 'add'), foo])
    }
}

const Foo = {
    render() {
        return h('p', { id: `id-${this.foo}` }, 'foo ->' + this.foo)
    }
}

createApp(App).mount('#app')
