import { render } from './render'
import { createVNode } from './vnode'

/**
 * 创建应用
 * @param rootComponent 组件 Object
 * @returns
 */
export function createApp(rootComponent) {
    return {
        // 启动应用
        mount(rootContainer) {
            // 根据传入的容器创建一个虚拟节点
            const vnode = createVNode(rootComponent)
            const appElement = document.querySelector(rootContainer)
            // 将虚拟节点转换为真实节点
            render(vnode, appElement)
        }
    }
}
