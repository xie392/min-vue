import { render } from "./render"
import { createVNode } from "./vnode"

export function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 根据传入的容器创建一个虚拟节点
            const vnode = createVNode(rootComponent)

            // 将虚拟节点转换为真实节点
            render(vnode, rootContainer)

        }
    }
}

