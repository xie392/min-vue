import { reactive } from '../reactive'
import { effect, stop } from '../effect'

describe('effect', () => {
    // 测试 effect 的基本功能
    it('happy path', () => {
        const user = reactive({ age: 10 })

        let nextAge
        // uer.age 变化时，会重新执行 effect 函数
        effect(() => {
            nextAge = user.age + 1
        })

        // 第一次执行 effect 函数时，会收集依赖
        expect(nextAge).toBe(11)

        // 修改响应式数据，会触发 effect 函数的执行
        user.age++
        // 第二次执行 effect 函数时，会重新收集依赖
        expect(nextAge).toBe(12)
    })

    // 测试 effect 的返回值
    it('should return runner when call effect', () => {
        let foo = 10
        const runner = effect(() => {
            foo++
            return 'foo'
        })

        expect(foo).toBe(11)

        const r = runner()

        expect(foo).toBe(12)
        expect(r).toBe('foo')
    })

    // 测试 effect 的 scheduler
    it('scheduler', () => {
        let dummy
        let run: any
        const scheduler = jest.fn(() => {
            run = runner
        })
        const obj = reactive({ foo: 1 })
        const runner = effect(
            () => {
                dummy = obj.foo
            },
            { scheduler }
        )

        expect(scheduler).not.toHaveBeenCalled()
        expect(dummy).toBe(1)

        // 应该在第一次触发时调用
        obj.foo++
        expect(scheduler).toHaveBeenCalledTimes(1)
        // should not run yet
        expect(dummy).toBe(1)

        // manually run
        run()
        // should have run
        expect(dummy).toBe(2)
    })

    // stop 方法的基本功能
    it('stop', () => {
        let dummy
        const obj = reactive({ prop: 1 })
        const runner = effect(() => {
            dummy = obj.prop // 1
        })

        obj.prop = 2
        expect(dummy).toBe(2)

        // 停止副作用函数的执行
        stop(runner)

        obj.prop++

        // 停止执行后，再次修改响应式数据，dummy 的值不会改变
        obj.prop = 3
        expect(dummy).toBe(2)

        runner()
        expect(dummy).toBe(3)
    })

    // onStop 参数的基本功能
    it('onStop', () => {
        const obj = reactive({ foo: 1 })
        const onStop = jest.fn()
        let dummy
        const runner = effect(
            () => {
                dummy = obj.foo
            },
            {
                onStop
            }
        )

        stop(runner)
        expect(onStop).toBeCalledTimes(1)
    })
})
