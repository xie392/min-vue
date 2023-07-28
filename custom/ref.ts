

type RefInterface = string | number | boolean

/**
 * 简易版 ref 不接收对象
 * @param target string | number | boolean
 */
class RefImpl {
    private _value: RefInterface
    // 用于判断是否是 ref 对象
    public __v_isRef = true

    constructor(value: RefInterface) {
        this._value = value
        // TODO: 如果是对象，就把对象的每个属性都转换成 reactive 对象
        // 由于这是简易版，所以不考虑对象的情况
    }

    get value() {
        return this._value
    }

    set value(newValue) {
        // 只有新值和旧值不相等的时候才会触发更新
        if (newValue !== this._value) {
            this._value = newValue
        }
    }
}

/**
 * 创建 ref
 * @param target
 * @returns
 */
export function ref(target: RefInterface) {
    return new RefImpl(target)
}

/**
 * 判断是否是 ref 对象
 * @param target
 * @returns boolean
 */
export function isRef(target) {
    // 为什么要用 !! 而不是直接返回 true 或者 false
    // 如果 target 是 ref 对象，那么 target 没有 __v_isRef 属性，为 undefined
    // !!undefined => false
    return !!target.__v_isRef
}

