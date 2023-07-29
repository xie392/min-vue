import { h } from '../../lib/min-vue.esm.js'
import Foo from './Foo.js'

window.self = null
export default {
    name: 'App',

    render() {
        window.self = this
        // debugger
        // h is a function that creates a virtual DOM node
        // debugger
        return h(
            'div',
            {
                id: 'root',
                class: ['container', 'main']
                // onClick: () => {
                //     console.log('click')
                // }
                // onMouseenter: () => {
                //     console.log('mouseenter')
                // }
            },
            // string or array of virtual DOM nodes
            // 'Hello World'
            // ['Hello', 'World']
            // [
            //     h('p', {class:'red'}, 'hi'),
            //     h('p', {class:'blue'}, 'min-vue')
            // ]
            // 'hi ' + this.msg
            [
                h(Foo, {
                    msg: 'App msg',
                    onAdd: () => {
                        console.log('App onAdd')
                    }
                }),
                h('p', {}, 'App  ' + this.msg)
            ]
        )
    },

    setup() {
        return {
            msg: 'Hello World 666'
        }
    }
}
