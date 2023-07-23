# effect

## 1. 介绍

effect 函数用于执行一个函数，并在执行过程中收集依赖，当依赖发生变化时，会重新执行函数。
类似于 react 中的 `useEffect`。

## 2. 语法

```js
effect(fn: Function, options?: Object): ReactiveEffect
```

## 3. 参数

-   `fn`：要执行的函数
-   `options`：配置项，可选

## 4. 返回值

`ReactiveEffect`：一个函数，执行该函数会执行 `fn` 函数，并收集依赖。

## 5. 例子

```js
import { reactive, effect } from 'vue'

const user = reactive({ age: 10 })

let nextAge

// user.age 发生变化时，会重新执行 effect 函数
const runner =  effect(() => {
    nextAge = user.age + 1
})

console.log(nextAge) // 11

// 修改响应式数据，会触发 effect 函数的执行
user.age++

// 第二次执行 effect 函数时，会重新收集依赖
console.log(nextAge) // 12

// 里面提供了一个 stop 函数，用于停止依赖收集
runner.stop()

// 修改响应式数据，不会触发 effect 函数的执行
user.age++

console.log(nextAge) // 12

// 恢复依赖收集
runner.run()

// 修改响应式数据，会触发 effect 函数的执行
user.age++

console.log(nextAge) // 13
```