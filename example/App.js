import { h } from '../lib/min-vue.esm.js'

export default {
    name: 'App',

    render() {
        // h is a function that creates a virtual DOM node
        return h('div', 'Hello World' + this.msg)
    },

    setup() {
        return {
            msg: 'Hello World'
        }
    }
}
