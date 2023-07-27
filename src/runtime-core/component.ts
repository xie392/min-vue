export function createComponentInstance(vnode) {
    const instance = {
        type: vnode.type,
        props: {},
        vnode,
        render: null,
        setupState: null,
        isMounted: false
    }
    return instance
}

export function setupComponent(instance) {
    // TODO
    // initProps()
    // initSlots()

    setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
    const Component = instance.vnode.type

    const { setup } = Component

    if (setup) {
        const setupResult = setup()

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
