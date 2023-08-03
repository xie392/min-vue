import { effect } from '../reactivity/effect'
import { EMPTY_OBJ } from '../shared'
import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './vnode'

export function createReander(options) {
    const {
        createElement: hostCreateElement,
        insert: hostInsert,
        patchProps: hostPatchProps,
        remove: hostRemove,
        setElement:hostSetElementText
    } = options

    /**
     * 渲染函数
     * @param vnode         虚拟节点
     * @param container     容器
     */
    function render(vnode, container) {
        // 渲染vnode
        // 将vnode转换为真实dom
        // 将真实dom添加到容器中
        patch(null, vnode, container, null)
    }

    /**
     * 渲染vnode
     * @param vnode         虚拟节点
     * @param container     容器
     */
    function patch(n1, n2, container, parentComponent) {
        const { type, shapeFlag } = n2

        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent)
                break
            case Text:
                processText(n1, n2, container)
                break
            default:
                // 判断是不是 element 元素
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    // 组件
                    processComponent(n1, n2, container, parentComponent)
                }
        }
    }

    /**
     * 处理组件
     * @param vnode         虚拟节点
     * @param container     容器
     */
    function processComponent(n1, n2, container, parentComponent) {
        // 组件挂载逻辑
        mountComponent(n2, container, parentComponent)
    }

    /**
     * 处理组件
     * @param vnode  虚拟节点
     */
    function mountComponent(vnode, container, parentComponent) {
        // 组件挂载逻辑
        const instance = createComponentInstance(vnode, parentComponent)
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
        effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance
                const subTree = (instance.subTree = instance.render.call(proxy))

                patch(null, subTree, container, instance)
                vnode.el = subTree.el

                instance.isMounted = true
            } else {
                const { proxy } = instance
                const subTree = instance.render.call(proxy)
                const parentSubTree = instance.subTree
                instance.subTree = subTree

                patch(parentSubTree, subTree, container, instance)
            }
        })
    }

    /**
     * 处理元素
     * @param vnode         虚拟节点
     * @param container     容器
     */
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent)
        } else {
            patchElement(n1, n2, container)
        }
    }

    function patchElement(n1, n2, container) {
        // console.log('patchElement', n1, n2, container)
        const oldProps = (n1 && n1.props) || EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ

        const el = (n2.el = n1.el)

        // 处理children
        patchChildren(n1, n2, el)

        // 处理props
        patchProps(el, oldProps, newProps)
    }

    function patchChildren(n1, n2, el) {
        const { shapeFlag: prevShapeFlag, children: c1 } = n1
        const { shapeFlag, children: c2 } = n2

        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                umMountChildren(c1)
                // 设置文本
                hostSetElementText(el, c2)
            }
        }
    }

    function umMountChildren(children) {
        children.forEach((child) => {
            child.el && hostRemove(child.el, null)
        })
    }

    function patchProps(el, oldProps, newProps) {
        if (oldProps === newProps) return
        for (const key in newProps) {
            const prev = oldProps[key]
            const next = newProps[key]

            if (prev !== next) {
                hostPatchProps(el, key, prev, next)
            }
        }

        if (oldProps === EMPTY_OBJ) return

        for (const key in oldProps) {
            if (!(key in newProps)) {
                hostPatchProps(el, key, oldProps[key], null)
            }
        }
    }

    /**
     * 挂载元素
     * @param vnode         虚拟节点
     * @param container     容器
     */
    function mountElement(vnode, container, parentComponent) {
        const el = (vnode.el = hostCreateElement(vnode.type))

        const { props, children, shapeFlag } = vnode

        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(children, el, parentComponent)
        }

        // 处理props
        for (const key in props) {
            const val = props[key]
            // const isOn = (key) => /^on[A-Z]/.test(key)
            // 事件
            // if (isOn(key)) {
            //     const event = key.slice(2).toLowerCase()
            //     el.addEventListener(event, val)
            // } else {
            //     el.setAttribute(key, val)
            // }
            hostPatchProps(el, key, null, val)
        }

        // container.appendChild(el)
        hostInsert(el, container)
    }

    function mountChildren(children, container, parentComponent) {
        children.forEach((child) => {
            patch(null, child, container, parentComponent)
        })
    }

    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2.children, container, parentComponent)
    }

    function processText(n1, n2, container) {
        const { children } = n2
        const textNode = (n2.el = document.createTextNode(children))
        container.appendChild(textNode)
    }

    return {
        createApp: createAppAPI(render)
    }
}
