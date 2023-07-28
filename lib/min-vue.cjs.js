'use strict';

var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN"; // 1000
})(ShapeFlags || (ShapeFlags = {}));

const publicPropertiesMap = {
    $el: (i) => i.vnode.el
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function createComponentInstance(vnode) {
    // console.log('createComponentInstance', vnode)
    const instance = {
        type: vnode.type,
        props: vnode.props,
        vnode,
        render: vnode.type.render,
        setupState: vnode.type.setup(),
        isMounted: false
    };
    console.log('createComponentInstance', instance);
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
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
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
    patch(vnode, container);
}
/**
 * 渲染vnode
 * @param vnode         虚拟节点
 * @param container     容器
 */
function patch(vnode, container) {
    const { shapeFlag } = vnode;
    // 判断是不是 element 元素
    if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container);
    }
    else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 组件
        processComponent(vnode, container);
    }
}
/**
 * 处理组件
 * @param vnode         虚拟节点
 * @param container     容器
 */
function processComponent(vnode, container) {
    // 组件挂载逻辑
    mountComponent(vnode, container);
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
    setupRenderEffect(instance, vnode, container);
}
function setupRenderEffect(instance, vnode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    vnode.el = subTree.el;
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = (vnode.el = document.createElement(vnode.type));
    const { props, children, ShapeFlag } = vnode;
    if (ShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children;
    }
    else if (ShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(children, el);
    }
    // 处理props
    for (const key in props) {
        const val = props[key];
        el.setAttribute(key, val);
    }
    container.appendChild(el);
}
function mountChildren(children, container) {
    children.forEach((child) => {
        patch(child, container);
    });
}

/**
 * 创建虚拟节点
 * @param type          节点类型
 * @param props         节点属性
 * @param children      子节点
 * @returns             虚拟节点
 */
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlags(type),
        el: null
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }
    return vnode;
}
function getShapeFlags(type) {
    return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT;
}

/**
 * 创建应用
 * @param rootComponent 组件 Object
 * @returns
 */
function createApp(rootComponent) {
    return {
        // 启动应用
        mount(rootContainer) {
            // 根据传入的容器创建一个虚拟节点
            const vnode = createVNode(rootComponent);
            // 将虚拟节点转换为真实节点
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    // console.log('h', type, props, children)
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
