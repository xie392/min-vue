import { ShapeFlags } from '../shared/ShapeFlags'

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

/**
 * 创建虚拟节点
 * @param type          节点类型
 * @param props         节点属性
 * @param children      子节点
 * @returns             虚拟节点
 */
export function createVNode(type, props?, children?) {
    const vnode = {
        type, // 节点类型
        props, // 节点属性
        children, // 子节点
        shapeFlag: getShapeFlags(type), // 节点类型
        el: null, // 真实节点
        key: props && props.key ? props.key : null
    }

    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
    } else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    }

    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN
        }
    }

    return vnode
}

function getShapeFlags(type) {
    return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}

export function createTextVNode(text) {
    return createVNode(Text, null, text)
}
