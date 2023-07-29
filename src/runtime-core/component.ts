import { shallowReadonly } from '../reactivity/reactive'
import { PublicInstanceProxyHandlers } from './componentPubliclinst'
import { emit } from './componetEmit'
import { initProps } from './componetProps'

export function createComponentInstance(vnode) {
    const instance = {
        type: vnode.type,
        props: vnode.props,
        vnode,
        render: vnode.type.render,
        setupState: {},
        emit: () => {}
    }

    instance.emit = emit as any

    return instance
}

export function setupComponent(instance) {
    // 处理 props
    initProps(instance, instance.props)
    // initSlots()
    setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
    const Component = instance.vnode.type
    // 给组件实例添加代理
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

    const { setup } = Component

    if (setup) {
        // setup中的 props 不可修改
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        })
        instance.setupState = setupResult
        handleSetupResult(instance, setupResult)
    }
}

function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'function') {
        // setup返回的是render函数
        // 将render函数赋值给组件实例的render属性
        instance.render = setupResult
    }

    finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
    const Component = instance.type

    if (instance.render) {
        // 对模板编译成render函数
        instance.render = Component.render
    }
}
