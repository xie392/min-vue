/**
 * 简单的响应式实现
 * @param value     代理的对象
 * @returns
 */
export function reactive(value: any) {
    return new Proxy(value, {
        get(target, key) {
            const res = Reflect.get(target, key)
            // 收集依赖
            track(target, key)
            return res
        },
        set(target, key, value) {
            const res = Reflect.set(target, key, value)
            // 触发更新
            trigger(target, key)
            return res
        }
    })
}

/**
 * 收集依赖
 * @param target
 * @param key
 * @returns
 */
function track(target, key) {
    // TODO
}

/**
 * 触发更新
 * @param target
 * @param key
 * @returns
 */
function trigger(target, key) {
    // TODO
}
