import { track,trigger } from "./effect"

export function reactive(target) {
  return new Proxy(target, {
    /**
     * get 方法是一个捕获器，用于拦截对目标对象属性的访问请求
     * @param target    目标对象
     * @param key       目标对象的属性
     * @example
     * { foo: 1 }  target = { foo: 1 }  key = 'foo' 
     */
    get(target, key) {
        // Reflect.get() 方法基本等同于 target[key]， 用于获取对象的属性值
        const res = Reflect.get(target, key)

        // 依赖收集: 将副作用函数和响应式数据关联起来
        track(target, key)
        return res
    },
    /**
     * set 方法是一个捕获器，用于拦截对目标对象属性的设置请求
     * @param target    目标对象
     * @param key       目标对象的属性
     * @param value     目标对象的属性值
     * @example
     * { foo: 1 }  target = { foo: 1 }  key = 'foo'  value = 2 
     */
    set(target, key, value) {
        // Reflect.set() 方法基本等同于 target[key] = value， 用于设置对象的属性值
        const res = Reflect.set(target, key, value)

        // TODO: 触发依赖
        trigger(target, key)
        return res
    }
  })
}
