import { createApp, h, ref } from '../../lib/min-vue.esm.js'

const App = {
    setup() {
        const count = ref(0)

        const add = () => {
            count.value++
        }

        const props = ref({
            foo: 'foo',
            bar: 'bar'
        })

        const updateProps = () => {
            props.value.foo = 'foo-update'
        }

        const updateProps2 = () => {
            props.value.foo = undefined
        }

        const updateProps3 = () => {
            props.value = {
                foo: 'foo-update',
                bar: 'bar-update'
            }
        }

        return {
            add,
            count,
            props,
            updateProps,
            updateProps2,
            updateProps3
        }
    },
    render() {
        return h('div', { ...this.props }, [
            h('p', null, 'count: ' + this.count),
            h('button', { onClick: this.add }, 'add'),
            h('hr', null, ''),
            h('p', null, `props: { foo: ${this.props.foo}, bar: ${this.props.bar} }`),
            h('button', { onClick: this.updateProps }, '【更新 foo 为 foo-update 】'),
            h('button', { onClick: this.updateProps2 }, '【更新 foo 为 undefined 】'),
            h('button', { onClick: this.updateProps3 }, '【更新 foo 和 bar 为 foo-update 】'),
            // h('hr', null, ''),
            // h(Test, { foo: this.props.foo })
        ])
    }
}

const Test = {
    render() {
        return h('div', null, 'Test: ' + this.foo)
    }
}

createApp(App).mount('#app')
