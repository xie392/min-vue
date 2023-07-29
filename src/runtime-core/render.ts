import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'

/**
 * 渲染函数
 * @param vnode         虚拟节点
 * @param container     容器
 */
export function render(vnode, container) {
    // 渲染vnode
    // 将vnode转换为真实dom
    // 将真实dom添加到容器中
    patch(vnode, container)
}

/**
 * 渲染vnode
 * @param vnode         虚拟节点
 * @param container     容器
 */
function patch(vnode, container) {
    const { shapeFlag } = vnode

    // 判断是不是 element 元素
    if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container)
    } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 组件
        processComponent(vnode, container)
    }
}

/**
 * 处理组件
 * @param vnode         虚拟节点
 * @param container     容器
 */
function processComponent(vnode, container) {
    // 组件挂载逻辑
    mountComponent(vnode, container)
}

/**
 * 处理组件
 * @param vnode  虚拟节点
 */
function mountComponent(vnode, container) {
    // 组件挂载逻辑
    const instance = createComponentInstance(vnode)
    // debugger
    // 组件的setup方法
    setupComponent(instance)

    // 设置组件副作用
    setupRenderEffect(instance, vnode, container)
}

/**
 * 设置组件副作用
 * @param instance  组件实例
 * @param vnode     虚拟节点
 * @param container   容器
 */
function setupRenderEffect(instance, vnode, container) {
    const { proxy } = instance
    const subTree = instance.render.call(proxy)
    patch(subTree, container)
    vnode.el = subTree.el
}

/**
 * 处理元素 
 * @param vnode         虚拟节点
 * @param container     容器
 */
function processElement(vnode, container) {
    mountElement(vnode, container)
}

/**
 * 挂载元素
 * @param vnode         虚拟节点
 * @param container     容器
 */
function mountElement(vnode, container) {
    const el = (vnode.el = document.createElement(vnode.type))

    const { props, children, shapeFlag } = vnode

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(children, el)
    }

    // 处理props
    for (const key in props) {
        const val = props[key]
        const isOn = (key) => /^on[A-Z]/.test(key)
        // 事件
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase()
            el.addEventListener(event, val)
        } else {
            el.setAttribute(key, val)
        }
    }

    container.appendChild(el)
}

function mountChildren(children, container) {
    children.forEach((child) => {
        patch(child, container)
    })
}
