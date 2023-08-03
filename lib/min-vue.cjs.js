'use strict';

var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
    ShapeFlags[ShapeFlags["SLOTS_CHILDREN"] = 16] = "SLOTS_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));

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
        el: null,
        key: props && props.key ? props.key : null
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

const extend = Object.assign;
const EMPTY_OBJ = {};
/**
 * 判断是否是对象
 * @param val
 * @returns
 */
function isObject(val) {
    return val !== null && typeof val === 'object';
}
/**
 * 判断两个值是否相等
 * @param oldValue  旧值
 * @param newValue  新值
 * @returns
 */
const hasChanged = (oldValue, newValue) => !Object.is(oldValue, newValue);
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

let activeEffect;
let shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true;
        this._fn = fn;
    }
    run() {
        if (!this.active) {
            return this._fn();
        }
        // shouldTrack 用于控制是否收集依赖
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn();
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            clearEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function clearEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
/**
 * 用于依赖收集
 * 依赖收集的目的是为了在数据变化时重新执行副作用函数
 * 依赖收集的过程就是将副作用函数和响应式数据关联起来的过程
 * @param target    目标对象
 * @param key       目标对象的属性
 */
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    // 获取副作用函数
    let depsMap = targetMap.get(target);
    // 如果没有副作用函数，就创建一个
    if (!depsMap) {
        depsMap = new Map();
        // 将副作用函数和响应式数据关联起来
        targetMap.set(target, depsMap);
    }
    // 获取响应式数据的依赖
    let dep = depsMap.get(key);
    // 如果没有依赖，就创建一个
    if (!dep) {
        dep = new Set();
        // 将副作用函数和响应式数据关联起来
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    // 如果依赖中已经有了副作用函数，就不再重复收集
    if (dep.has(activeEffect))
        return;
    // 将副作用函数和响应式数据关联起来
    dep.add(activeEffect);
    // 将响应式数据和副作用函数关联起来
    activeEffect.deps.push(dep);
}
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
/**
 * 函数接收一个函数作为参数，
 * 这个函数就是我们的副作用函数，
 * effect 函数内部会执行这个副作用函数，
 * 同时会收集这个副作用函数中响应式数据的依赖，
 * 当依赖变化时，会重新执行这个副作用函数。
 * @param fn   副作用函数
 */
function effect(fn, options = {}) {
    // 创建副作用函数
    const _effect = new ReactiveEffect(fn, options.scheduler);
    extend(_effect, options);
    // 执行副作用函数
    _effect.run();
    // 返回一个函数，用于停止副作用函数的执行
    const runner = _effect.run.bind(_effect);
    // 将副作用函数挂载到 runner 上
    runner.effect = _effect;
    return runner;
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
        if (!isReadonly)
            track(target, key);
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

class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        // 收集依赖
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        // 判断新值和旧值是否相等
        if (hasChanged(newValue, this._rawValue)) {
            this._rawValue = newValue;
            this._value = convert(newValue);
            triggerEffects(this.dep);
        }
    }
}
function trackRefValue(ref) {
    // 收集依赖
    isTracking() && trackEffects(ref.dep);
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unref(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            // 返回原始值
            return unref(Reflect.get(target, key));
        },
        set(target, key, value) {
            // 判断是否是响应式数据 如果是响应式数据就直接修改值 不过这种情况很少出现
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
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

function createComponentInstance(vnode, parent) {
    // console.log('createComponentInstance', parent);
    const instance = {
        type: vnode.type,
        props: {},
        vnode,
        render: vnode.type.render,
        setupState: {},
        emit: () => { },
        solts: {},
        providers: parent ? parent.providers : {},
        parent,
        isMounted: false,
        subTree: null
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
        setCurrentInstance(instance);
        // setup中的 props 不可修改
        instance.setupState = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(null);
        handleSetupResult(instance, instance.setupState);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'object') {
        // setup返回的是render函数
        // 将render函数赋值给组件实例的render属性
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    // if (instance.render) {
    // 对模板编译成render函数
    instance.render = Component.render;
    // }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provider(key, value) {
    var _a;
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { providers, parent } = currentInstance;
        const parentProviders = (_a = parent === null || parent === void 0 ? void 0 : parent.providers) !== null && _a !== void 0 ? _a : {};
        if (providers === parentProviders) {
            providers = currentInstance.providers = Object.create(parentProviders || null);
        }
        providers[key] = value;
    }
}
function inject(key, defaultValue) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProviders = currentInstance.parent.providers;
        if (key in parentProviders) {
            return parentProviders[key];
        }
        else {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

// import { render } from './render'
function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            // 启动应用
            mount(rootContainer) {
                // 根据传入的容器创建一个虚拟节点
                const vnode = createVNode(rootComponent);
                // const appElement = document.querySelector(rootContainer)
                if (typeof rootContainer === 'string') {
                    rootContainer = document.querySelector(rootContainer);
                }
                // 将虚拟节点转换为真实节点
                render(vnode, rootContainer);
            }
        };
    };
}
/**
 * 创建应用
 * @param rootComponent 组件 Object
 * @returns
 */
// export

function createReander(options) {
    const { createElement: hostCreateElement, insert: hostInsert, patchProps: hostPatchProps, remove: hostRemove, setElement: hostSetElementText } = options;
    /**
     * 渲染函数
     * @param vnode         虚拟节点
     * @param container     容器
     */
    function render(vnode, container) {
        // 渲染vnode
        // 将vnode转换为真实dom
        // 将真实dom添加到容器中
        patch(null, vnode, container, null);
    }
    /**
     * 渲染vnode
     * @param vnode         虚拟节点
     * @param container     容器
     */
    function patch(n1, n2, container, parentComponent) {
        const { type, shapeFlag } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                // 判断是不是 element 元素
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    // 组件
                    processComponent(n1, n2, container, parentComponent);
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
        mountComponent(n2, container, parentComponent);
    }
    /**
     * 处理组件
     * @param vnode  虚拟节点
     */
    function mountComponent(vnode, container, parentComponent) {
        // 组件挂载逻辑
        const instance = createComponentInstance(vnode, parentComponent);
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
        effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy));
                patch(null, subTree, container, instance);
                vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const parentSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(parentSubTree, subTree, container, instance);
            }
        });
    }
    /**
     * 处理元素
     * @param vnode         虚拟节点
     * @param container     容器
     */
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent);
        }
        else {
            patchElement(n1, n2, container, parentComponent);
        }
    }
    function patchElement(n1, n2, container, parentComponent) {
        const oldProps = (n1 && n1.props) || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = (n2.el = n1.el);
        // 处理children
        patchChildren(n1, n2, el, parentComponent);
        // 处理props
        patchProps(el, oldProps, newProps);
    }
    function patchChildren(n1, n2, el, parentComponent) {
        const { shapeFlag: prevShapeFlag, children: c1 } = n1;
        const { shapeFlag, children: c2 } = n2;
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                umMountChildren(c1);
            }
            if (c1 !== c2) {
                hostSetElementText(el, c2);
            }
        }
        else {
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(el, '');
                mountChildren(c2, el, parentComponent);
            }
            else {
                patchKeyedChildren(c1, c2, el, parentComponent);
            }
        }
    }
    function isSameVNodeType(n1, n2) {
        return n1.type === n2.type && n1.key === n2.key;
    }
    // diff 算法
    function patchKeyedChildren(c1, c2, el, parentComponent) {
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = c2.length - 1;
        // 左侧对比
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, el, parentComponent);
            }
            else {
                break;
            }
            i++;
        }
        // 右侧对比
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, el, parentComponent);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        // 1. 旧的比新的多，需要删除
        if (i > e1) {
            if (i <= e2) {
                patch(null, c2[i], el, parentComponent);
            }
        }
    }
    function umMountChildren(children) {
        children.forEach((child) => {
            child.el && hostRemove(child.el, null);
        });
    }
    // 处理props
    function patchProps(el, oldProps, newProps) {
        if (oldProps === newProps)
            return;
        for (const key in newProps) {
            const prev = oldProps[key];
            const next = newProps[key];
            if (prev !== next) {
                hostPatchProps(el, key, prev, next);
            }
        }
        if (oldProps === EMPTY_OBJ)
            return;
        for (const key in oldProps) {
            if (!(key in newProps)) {
                hostPatchProps(el, key, oldProps[key], null);
            }
        }
    }
    /**
     * 挂载元素
     * @param vnode         虚拟节点
     * @param container     容器
     */
    function mountElement(vnode, container, parentComponent) {
        const el = (vnode.el = hostCreateElement(vnode.type));
        const { props, children, shapeFlag } = vnode;
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children;
        }
        else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(children, el, parentComponent);
        }
        // 处理props
        for (const key in props) {
            const val = props[key];
            // const isOn = (key) => /^on[A-Z]/.test(key)
            // 事件
            // if (isOn(key)) {
            //     const event = key.slice(2).toLowerCase()
            //     el.addEventListener(event, val)
            // } else {
            //     el.setAttribute(key, val)
            // }
            hostPatchProps(el, key, null, val);
        }
        // container.appendChild(el)
        hostInsert(el, container);
    }
    function mountChildren(children, container, parentComponent) {
        children.forEach((child) => {
            patch(null, child, container, parentComponent);
        });
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2.children, container, parentComponent);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.appendChild(textNode);
    }
    return {
        createApp: createAppAPI(render)
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProps(el, key, prevVal, nextVal) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    // 事件
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextVal);
    }
    else {
        if (nextVal == null || nextVal == undefined) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
}
function insert(el, parent) {
    parent.appendChild(el);
}
function remove(el) {
    const parent = el.parentNode;
    if (parent) {
        parent.removeChild(el);
    }
}
function setElement(el, text) {
    el.textContent = text;
}
const render = createReander({
    createElement,
    patchProps,
    insert,
    remove,
    setElement
});
function createApp(...args) {
    return render.createApp(...args);
}

exports.createApp = createApp;
exports.createReander = createReander;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.isRef = isRef;
exports.provider = provider;
exports.proxyRefs = proxyRefs;
exports.reactive = reactive;
exports.ref = ref;
exports.renderSlots = renderSlots;
exports.unref = unref;
