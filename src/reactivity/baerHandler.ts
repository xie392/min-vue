import { extend, isObject } from '../shared/index'
import { track, trigger } from './effect'
import { ReactiveFlags, reactive, readonly } from './reactive'

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

/**
 * 创建一个 get 函数
 * @param isReadonly    是否只读
 * @param shallow       是否浅层
 * @returns
 */
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly
        }

        const res = Reflect.get(target, key)

        if (shallow) {
            return res
        }

        // 如果是对象，就递归调用 reactive 函数
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res)
        }

        if (!isReadonly) track(target, key)

        return res
    }
}

/**
 * 创建一个 set 函数
 * @returns
 */
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value)
        trigger(target, key)
        return res
    }
}

export const mutableHandlers = { get, set }

export const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`key: ${key as string} set failed`)
        return true
    }
}

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
})
