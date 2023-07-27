import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from './baerHandler'

export enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly'
}

export function reactive(target) {
    return createActiveObject(target, mutableHandlers)
}

export function readonly(target) {
    return createActiveObject(target, readonlyHandlers)
}

export function isReactive(target) {
    // 判断是否是响应式数据
    return !!target[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(target) {
    // 判断是否是只读数据
    return !!target[ReactiveFlags.IS_READONLY]
}

export function isProxy(target) {
    // 判断是否是代理数据
    return isReactive(target) || isReadonly(target)
}

export function shallowReadonly(target) {
    return createActiveObject(target, shallowReadonlyHandlers)
}

function createActiveObject(target, baseHandlers) {
    return new Proxy(target, baseHandlers)
}
