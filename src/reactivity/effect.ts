import { extend } from '../shared/index'

let activeEffect: ReactiveEffect
let shouldTrack: boolean

export class ReactiveEffect {
    _fn: Function
    deps: any[] = []
    active = true
    onStop?: () => void

    constructor(
        fn: Function,
        private scheduler?: Function | undefined
    ) {
        this._fn = fn
    }

    run() {
        if (!this.active) {
            return this._fn()
        }
        // shouldTrack 用于控制是否收集依赖
        shouldTrack = true
        activeEffect = this

        const result = this._fn()

        shouldTrack = false

        return result
    }

    stop() {
        if (this.active) {
            clearEffect(this)
            if (this.onStop) {
                this.onStop()
            }
            this.active = false
        }
    }
}

function clearEffect(effect) {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect)
    })
    effect.deps.length = 0
}

export function isTracking() {
    return shouldTrack && activeEffect !== undefined
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
    if (!isTracking()) return
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

    trackEffects(dep)
}

export function trackEffects(dep) {
    // 如果依赖中已经有了副作用函数，就不再重复收集
    if (dep.has(activeEffect)) return

    // 将副作用函数和响应式数据关联起来
    dep.add(activeEffect)

    // 将响应式数据和副作用函数关联起来
    activeEffect.deps.push(dep)
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
    triggerEffects(dep)
}

export function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler()
        } else {
            effect.run()
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
export function effect(fn, options: any = {}) {
    // 创建副作用函数
    const _effect = new ReactiveEffect(fn, options.scheduler)

    extend(_effect, options)

    // 执行副作用函数
    _effect.run()

    // 返回一个函数，用于停止副作用函数的执行
    const runner: any = _effect.run.bind(_effect)

    // 将副作用函数挂载到 runner 上
    runner.effect = _effect

    return runner
}

/**
 * 停止副作用函数的执行
 * @param runner    副作用函数
 */
export function stop(runner) {
    runner.effect.stop()
}
