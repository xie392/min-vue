var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
    ShapeFlags[ShapeFlags["SLOTS_CHILDREN"] = 16] = "SLOTS_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));

const extend = Object.assign;
/**
 * 判断是否是对象
 * @param val
 * @returns
 */
function isObject(val) {
    return val !== null && typeof val === 'object';
}
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const camelized = (str) => {
    return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''));
};
const capitalized = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const toHandlerKey = (str) => {
    return str ? `on${capitalized(str)}` : '';
};
const isArray = Array.isArray;

/**
 * 用于依赖收集
 * 依赖收集的目的是为了在数据变化时重新执行副作用函数
 * 依赖收集的过程就是将副作用函数和响应式数据关联起来的过程
 * @param target    目标对象
 * @param key       目标对象的属性
 */
const targetMap = new Map();
/**
 * 用于触发依赖
 * 触发依赖的目的是为了在数据变化时重新执行副作用函数
 * @param target
 * @param key
 * @returns
 */
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
/**
 * 创建一个 get 函数
 * @param isReadonly    是否只读
 * @param shallow       是否浅层
 * @returns
 */
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly;
        }
        else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        // 如果是对象，就递归调用 reactive 函数
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
/**
 * 创建一个 set 函数
 * @returns
 */
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = { get, set };
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`key: ${key} set failed`);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

var ReactiveFlags;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "__v_isReactive";
    ReactiveFlags["IS_READONLY"] = "__v_isReadonly";
})(ReactiveFlags || (ReactiveFlags = {}));
function reactive(target) {
    return createActiveObject(target, mutableHandlers);
}
function readonly(target) {
    return createActiveObject(target, readonlyHandlers);
}
function shallowReadonly(target) {
    // if (isObject(target)) {
    //     console.warn(`value cannot be made reactive: ${String(target)}`);
    // }
    return createActiveObject(target, shallowReadonlyHandlers);
}
function createActiveObject(target, baseHandlers) {
    return new Proxy(target, baseHandlers);
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (setupState && hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (props && hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function initSlots(instance, children) {
    if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
        instance.slots = normalizeSlotObject(children);
    }
}
function normalizeSlotValue(value) {
    return isArray(value) ? value : [value];
}
function normalizeSlotObject(children) {
    const slots = {};
    for (const key in children) {
        const val = children[key];
        slots[key] = (props) => normalizeSlotValue(val(props));
    }
    return slots;
}

function emit(instance, event, ...args) {
    const { props } = instance;
    const handlerName = toHandlerKey(camelized(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

function createComponentInstance(vnode) {
    const instance = {
        type: vnode.type,
        props: {},
        vnode,
        render: vnode.type.render,
        setupState: {},
        emit: () => { },
        solts: {}
    };
    instance.emit = emit.bind(null, instance);
    return instance;
}
function setupComponent(instance) {
    // 处理 props
    initProps(instance, instance.vnode.props);
    // 处理插槽
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.vnode.type;
    // 给组件实例添加代理
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        // setup中的 props 不可修改
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        instance.setupState = setupResult;
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

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
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
        el: null // 真实节点
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN;
        }
    }
    return vnode;
}
function getShapeFlags(type) {
    return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT;
}
function createTextVNode(text) {
    return createVNode(Text, null, text);
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
    const { type, shapeFlag } = vnode;
    switch (type) {
        case Fragment:
            processFragment(vnode, container);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            // 判断是不是 element 元素
            if (shapeFlag & ShapeFlags.ELEMENT) {
                processElement(vnode, container);
            }
            else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                // 组件
                processComponent(vnode, container);
            }
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
    // debugger
    // 组件的setup方法
    setupComponent(instance);
    // 设置组件副作用
    setupRenderEffect(instance, vnode, container);
}
/**
 * 设置组件副作用
 * @param instance  组件实例
 * @param vnode     虚拟节点
 * @param container   容器
 */
function setupRenderEffect(instance, vnode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    vnode.el = subTree.el;
}
/**
 * 处理元素
 * @param vnode         虚拟节点
 * @param container     容器
 */
function processElement(vnode, container) {
    mountElement(vnode, container);
}
/**
 * 挂载元素
 * @param vnode         虚拟节点
 * @param container     容器
 */
function mountElement(vnode, container) {
    const el = (vnode.el = document.createElement(vnode.type));
    const { props, children, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children;
    }
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(children, el);
    }
    // 处理props
    for (const key in props) {
        const val = props[key];
        const isOn = (key) => /^on[A-Z]/.test(key);
        // 事件
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    container.appendChild(el);
}
function mountChildren(children, container) {
    children.forEach((child) => {
        patch(child, container);
    });
}
function processFragment(vnode, container) {
    mountChildren(vnode.children, container);
}
function processText(vnode, container) {
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.appendChild(textNode);
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
            const appElement = document.querySelector(rootContainer);
            // 将虚拟节点转换为真实节点
            render(vnode, appElement);
        }
    };
}

function h(type, props, children) {
    // console.log('h', type, props, children)
    // debugger
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            // slot(props)
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

export { createApp, createTextVNode, h, renderSlots };
