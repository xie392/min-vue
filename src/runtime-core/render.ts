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
        setElement: hostSetElementText
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
            patchElement(n1, n2, container, parentComponent)
        }
    }

    function patchElement(n1, n2, container, parentComponent) {
        const oldProps = (n1 && n1.props) || EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ

        const el = (n2.el = n1.el)
        // 处理children
        patchChildren(n1, n2, el, parentComponent)

        // 处理props
        patchProps(el, oldProps, newProps)
    }

    function patchChildren(n1, n2, el, parentComponent) {
        const { shapeFlag: prevShapeFlag, children: c1 } = n1
        const { shapeFlag, children: c2 } = n2

        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                umMountChildren(c1)
            }
            if (c1 !== c2) {
                hostSetElementText(el, c2)
            }
        } else {
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(el, '')
                mountChildren(c2, el, parentComponent)
            } else {
                patchKeyedChildren(c1, c2, el, parentComponent)
            }
        }
    }

    function isSameVNodeType(n1, n2) {
        return n1.type === n2.type && n1.key === n2.key
    }

    // diff 算法
    function patchKeyedChildren(c1, c2, el, parentComponent) {
        let i = 0
        let e1 = c1.length - 1
        let e2 = c2.length - 1

        // 左侧对比
        while (i <= e1 && i <= e2) {
            const n1 = c1[i]
            const n2 = c2[i]

            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, el, parentComponent)
            } else {
                break
            }
            i++
        }

        // 右侧对比
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1]
            const n2 = c2[e2]

            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, el, parentComponent)
            } else {
                break
            }
            e1--
            e2--
        }

        // 1. 旧的比新的多，需要删除
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1
                const anchor = nextPos < c2.length ? c2[nextPos].el : null

                while (i <= e2) {
                    patch(null, c2[i], el, parentComponent)
                    i++
                }
            } else if (i > e2) {
                while (i <= e1) {
                    hostRemove(c1[i].el)
                    i++
                }
            } else {
                let s1 = i
                let s2 = i
                const keyToNewIndexMap = new Map()

                for (let i = s1; i <= e2; i++) {
                    const nextChild = c2[i]
                    keyToNewIndexMap.set(nextChild.key, i)
                }

                for (let i = s1; i <= e1; i++) {
                    const prevChild = c1[i]
                    let newIndex = 0

                    if (prevChild === null) {
                        newIndex = keyToNewIndexMap.get(prevChild.key)
                    } else {
                        for (let j = s2; j <= e2; j++) {
                            if (isSameVNodeType(prevChild, c2[j])) {
                                newIndex = j
                                break
                            }
                        }
                    }

                    if (newIndex === undefined) {
                        hostRemove(prevChild.el)
                    } else {
                        patch(prevChild, c2[newIndex], el, parentComponent)
                        c2[newIndex] = null
                    }
                }
            }
        }
    }

    function umMountChildren(children) {
        children.forEach((child) => {
            child.el && hostRemove(child.el, null)
        })
    }

    // 处理props
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
