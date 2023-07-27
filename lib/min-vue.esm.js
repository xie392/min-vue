function createComponentInstance(vnode) {
    const instance = {
        type: vnode.type,
        props: {},
        vnode,
        render: null,
        setupState: null,
        isMounted: false
    };
    return instance;
}
function setupComponent(instance) {
    // TODO
    // initProps()
    // initSlots()
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.vnode.type;
    const { setup } = Component;
    if (setup) {
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'function') {
        // setup返回的是render函数
        // 将render函数赋值给组件实例的render属性
        instance.render = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (instance.render) {
        // 对模板编译成render函数
        instance.render = Component.render;
    }
}

/**
 * 渲染函数
 * @param vnode         虚拟节点
 * @param container     容器
 */
function render(vnode, container) {
    // 渲染vnode
    // 将vnode转换为真实dom
    // 将真实dom添加到容器中
    patch(vnode);
}
/**
 * 渲染vnode
 * @param vnode         虚拟节点
 * @param container     容器
 */
function patch(vnode, container) {
    processComponent(vnode);
}
/**
 * 处理组件
 * @param vnode         虚拟节点
 * @param container     容器
 */
function processComponent(vnode, container) {
    // 组件挂载逻辑
    mountComponent(vnode);
}
/**
 * 处理组件
 * @param vnode  虚拟节点
 */
function mountComponent(vnode, container) {
    // 组件挂载逻辑
    const instance = createComponentInstance(vnode);
    // 组件的setup方法
    setupComponent(instance);
    // 设置组件副作用
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    patch(subTree);
}

/**
 * 创建虚拟节点
 * @param type          节点类型
 * @param props         节点属性
 * @param children      子节点
 * @returns
 */
function createVNode(type, props, children) {
    return {
        type,
        props,
        children
    };
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 根据传入的容器创建一个虚拟节点
            const vnode = createVNode(rootComponent);
            // 将虚拟节点转换为真实节点
            render(vnode);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
