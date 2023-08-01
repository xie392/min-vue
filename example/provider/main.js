import { createApp, h, provider, inject } from '../../lib/min-vue.esm.js'

const App = {
    setup() {
        provider('foo', 'bar')
    },
    render() {
        return h('div', null, [h('p', null, 'This a App'), h(Foo)])
    }
}

const Foo = {
    setup() {
        const foo = inject('foo')
        console.log('Foo', foo)

        return {
            foo
        }
    },
    render() {
        return h('div', null, [h('p', null, 'This a Foo: ' + this.foo), h(Child)])
    }
}

const Child = {
    setup() {
        const foo = inject('foo')
        const val = inject('val','default value')
        return {
            foo,
            val
        }
    },
    render() {
        return h('div', null, 'This a child: App->foo  ' + this.foo + ' default: ' + this.val)
    }
}

createApp(App).mount('#app')
