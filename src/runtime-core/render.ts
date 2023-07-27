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
    // 处理组件

    // 判断是不是 element 元素
    processElement(vnode, container)


    processComponent(vnode, container)
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

    // 组件的setup方法
    setupComponent(instance)

    // 设置组件副作用
    setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
    const subTree = instance.render()

    patch(subTree, container)
}

function processElement(vnode, container) {
    mountElement(vnode, container)
}



function mountElement(vnode, container) {

}



