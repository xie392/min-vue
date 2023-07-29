import { createVNode } from './vnode'

export function h(type, props?, children?) {
    // console.log('h', type, props, children)
    // debugger
    return createVNode(type, props, children)
}
