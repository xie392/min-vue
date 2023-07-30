import { h } from '../../lib/min-vue.esm.js'

export default {
    setup(props, { emit }) {
        console.log('Foo props', props)
        // console.log('Foo emit', emit)
        
        const add = () => {
            console.log('Foo add')
            emit('add',1,2)
            emit('add-foo',4,5)
        }

        return {
            add
        }
    },
    render() {
        const btn = h(
            'button',
            {
                onClick: this.add
            },
            'Click me'
        )
        const p = h('p', {}, 'props ' + this.msg)
        return h('div', {}, [btn, p])
    }
}
