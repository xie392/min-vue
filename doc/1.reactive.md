# reactive

## 1. 介绍

`reactive` 函数用于将一个对象转换为响应式对象，当响应式对象发生变化时，会触发依赖收集，当依赖发生变化时，会触发更新。

## 2. 语法

```js
reactive(target: Object): Proxy
```

## 3. 参数

-   `target`：要转换的对象

## 4. 返回值

`Proxy`：一个代理对象，当访问代理对象时，会触发依赖收集，当修改代理对象时，会触发更新。

## 5. 例子

```js
import { reactive } from 'vue'

const user = reactive({ age: 10 })

user.age++ // 触发更新
```

## 6. 简易实现

以：`const user = reactive({ age: 10 })` 为例，当访问 `user.age` 时，会触发依赖收集，当修改 `user.age` 时，会触发更新。

```js
function reactive(target) {
    const handler = {
        /**
         * @param {Object} target 目标对象
         * @param {String} key 属性名
         * @param {Object} receiver 代理对象
         * @returns {any} 返回属性值
         * @example
         *
         * user => { age: 10 }     target
         * age  => 'age'           key
         * user => Proxy           receiver
         */
        get(target, key, receiver) {
            // TODO:这里会做一些依赖收集，但是现在我们暂时不关心
            // track(target, key)

            // 返回属性值
            return Reflect.get(target, key, receiver)
        },
        /**
         * @param {Object} target 目标对象
         * @param {String} key 属性名
         * @param {any} value 属性值
         * @param {Object} receiver 代理对象
         */
        set(target, key, value, receiver) {
            // 触发更新
            const result = Reflect.set(target, key, value, receiver)

            // TODO:这里会做一些更新操作，但是现在我们暂时不关心
            // trigger(target, key)

            return result
        }
    }

    // 返回代理对象
    return new Proxy(target, handler)
}
```

## 7. 案例测试

```js
import { reactive } from 'vue'

const user = reactive({ age: 10 })

user.age++ // 触发更新

console.log(user.age) // 11
```
