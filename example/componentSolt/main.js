import { createApp, h, renderSlots,createTextVNode } from '../../lib/min-vue.esm.js'

const App = {
    setup() {},
    render() {
        const foo = h(
            Foo,
            {},
            {
                header: (props) => h('p', null, 'This is a span Solt Header ' + props.name),
                footer: () => createTextVNode('This is a span Solt Footer')
            }
        )

        return h('div', null, [h('p', null, 'This a App'), foo])
    }
}

const Foo = {
    setup() {
        return {}
    },
    render() {
        console.log('foo render', this.$slots)
        return h('div', null, [
            h('p', null, 'This a Foo'),
            renderSlots(this.$slots, 'header', { name: 'foo' }),
            renderSlots(this.$slots, 'footer')
        ])
    }
}

createApp(App).mount('#app')
