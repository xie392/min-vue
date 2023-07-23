class ReactiveEffect {
    private _fn: any

    constructor(fn) {
        this._fn = fn
    }

    run() {
        activeEffect = this
        this._fn()
    }
}

/**
 * 用于依赖收集
 * 依赖收集的目的是为了在数据变化时重新执行副作用函数
 * 依赖收集的过程就是将副作用函数和响应式数据关联起来的过程
 * @param target    目标对象
 * @param key       目标对象的属性
 */
const targetMap = new Map()
export function track(target, key) {
    // 获取副作用函数
    let depsMap = targetMap.get(target)

    // 如果没有副作用函数，就创建一个
    if (!depsMap) {
        depsMap = new Map()
        // 将副作用函数和响应式数据关联起来
        targetMap.set(target, depsMap)
    }

    // 获取响应式数据的依赖
    let dep = depsMap.get(key)

    // 如果没有依赖，就创建一个
    if (!dep) {
        dep = new Set()
        // 将副作用函数和响应式数据关联起来
        depsMap.set(key, dep)
    }

    dep.add(activeEffect)
}

/**
 * 用于触发依赖
 * 触发依赖的目的是为了在数据变化时重新执行副作用函数
 * @param target
 * @param key
 * @returns
 */
export function trigger(target, key) {
    let depsMap = targetMap.get(target)
    let dep = depsMap.get(key)

    for (const effect of dep) {
        effect.run()
    }
    // return true
}

/**
 * 函数接收一个函数作为参数，
 * 这个函数就是我们的副作用函数，
 * effect 函数内部会执行这个副作用函数，
 * 同时会收集这个副作用函数中响应式数据的依赖，
 * 当依赖变化时，会重新执行这个副作用函数。
 * @param fn   副作用函数
 */
let activeEffect
export function effect(fn) {
    const _effect = new ReactiveEffect(fn)

    _effect.run()
}
