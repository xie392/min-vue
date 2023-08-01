import { hasChanged, isObject } from '../shared/index'
import { trackEffects, triggerEffects, isTracking } from './effect'
import { reactive } from './reactive'

class RefImpl {
    private _value: any
    public dep
    private _rawValue: any
    public __v_isRef = true

    constructor(value) {
        this._rawValue = value
        this._value = convert(value)
        this.dep = new Set()
    }
    get value() {
        // 收集依赖
        trackRefValue(this)
        return this._value
    }
    set value(newValue) {
        // 判断新值和旧值是否相等
        if (hasChanged(newValue, this._rawValue)) {
            this._rawValue = newValue
            this._value = convert(newValue)
            triggerEffects(this.dep)
        }
    }
}

function trackRefValue(ref) {
    // 收集依赖
    isTracking() && trackEffects(ref.dep)
}

function convert(value) {
    return isObject(value) ? reactive(value) : value
}

export function ref(value) {
    return new RefImpl(value)
}

export function isRef(ref) {
    return !!ref.__v_isRef
}

export function unref(ref) {
    return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            // 返回原始值
            return unref(Reflect.get(target, key))
        },
        set(target, key, value) {
            // 判断是否是响应式数据 如果是响应式数据就直接修改值 不过这种情况很少出现
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value)
            } else {
                return Reflect.set(target, key, value)
            }
        }
    })
}
