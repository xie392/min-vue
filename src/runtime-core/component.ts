import { proxyRefs } from '../reactivity'
import { shallowReadonly } from '../reactivity/reactive'
import { PublicInstanceProxyHandlers } from './componentPubliclinst'
import { initSlots } from './componentSlots'
import { emit } from './componetEmit'
import { initProps } from './componetProps'

export function createComponentInstance(vnode, parent) {
    // console.log('createComponentInstance', parent);
    const instance = {
        type: vnode.type,
        props: {},
        vnode,
        render: vnode.type.render,
        setupState: {},
        emit: () => {},
        solts: {},
        providers: parent ? parent.providers : {},
        parent,
        isMounted: false,
        subTree: null
    }

    instance.emit = emit.bind(null, instance) as any

    return instance
}

export function setupComponent(instance) {
    // 处理 props
    initProps(instance, instance.vnode.props)
    // 处理插槽
    initSlots(instance, instance.vnode.children)
    setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
    const Component = instance.vnode.type
    // 给组件实例添加代理
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

    const { setup } = Component

    if (setup) {
        setCurrentInstance(instance)
        // setup中的 props 不可修改
        instance.setupState = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        })
        setCurrentInstance(null)
        handleSetupResult(instance, instance.setupState)
    }
}

function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'object') {
        // setup返回的是render函数
        // 将render函数赋值给组件实例的render属性
        instance.setupState = proxyRefs(setupResult)
    }

    finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
    const Component = instance.type
    // if (instance.render) {
    // 对模板编译成render函数
    instance.render = Component.render
    // }
}

let currentInstance = null
export function getCurrentInstance() {
    return currentInstance
}

function setCurrentInstance(instance) {
    currentInstance = instance
}
