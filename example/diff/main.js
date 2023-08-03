import { createApp, h, ref } from '../../lib/min-vue.esm.js'

// 左侧对比
const prevChildren = [h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B'), h('p', { key: 'C' }, 'C')]
const nextChildren = [
    h('p', { key: 'A' }, 'A'),
    h('p', { key: 'B' }, 'B'),
    h('p', { key: 'C' }, 'C'),
    h('p', { key: 'D' }, 'D'),
    h('p', { key: 'E' }, 'E')
]

const App = {
    render() {
        return h('div', null, [
            h('h1', null, '左侧对比'),
            h('div', null, prevChildren),
            h('h1', null, '右侧对比'),
            h('div', null, nextChildren)
        ])
    }
}

createApp(App).mount('#app')
