import { createApp, h } from '../../lib/min-vue.esm.js'

const App = {
    render() {
        const foo = h(Foo, {
            msg: 'app msg',
            onFooClick: (num) => {
                console.log('app onFooClick', num)
            }
        })

        return h('div', null, [h('p', null, 'This a App'), foo])
    }
}

const Foo = {
    // 接收 props, emit
    setup(props, { emit }) {
        const handleClick = () => {
            console.log('foo handleClick', props)
            // 触发事件
            emit('fooClick', 1)
        }

        return {
            handleClick
        }
    },
    render() {
        return h('div', null, [h('p', null, 'This a Foo'), h('button', { onClick: this.handleClick }, 'click me')])
    }
}

createApp(App).mount('#app')
