import { h } from '../lib/min-vue.esm.js'

window.self = null
export default {
    name: 'App',

    render() {
        window.self = this
        // h is a function that creates a virtual DOM node
        return h(
            'div',
            {
                id: 'root',
                class: ['container', 'main']
            },
            // string or array of virtual DOM nodes
            // 'Hello World'
            // ['Hello', 'World']
            // [
            //     h('p', {class:'red'}, 'hi'),
            //     h('p', {class:'blue'}, 'min-vue')
            // ]
            'hi ' + this.msg
        )
    },

    setup() {
        return {
            msg: 'Hello World 666'
        }
    }
}
