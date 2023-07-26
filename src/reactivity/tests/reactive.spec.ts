import { reactive, isReactive, isReadonly, readonly } from '../reactive'

describe('reactive', () => {
    // 响应式对象
    it('happy path', () => {
        const original = { foo: 1 }
        const observed = reactive(original)
        expect(observed).not.toBe(original)
        expect(observed.foo).toBe(1)

        const obs2 = readonly(observed)

        expect(isReadonly(obs2)).toBe(true)
        expect(isReadonly(observed)).toBe(false)

        expect(isReactive(observed)).toBe(true)
        expect(isReactive(original)).toBe(false)
    })

    // 嵌套响应式
    it('nested reactive', () => {
        const original = {
            nested: {
                foo: 1
            },
            array: [{ bar: 2 }]
        }
        const observed = reactive(original)
        expect(isReactive(observed.nested)).toBe(true)
        expect(isReactive(observed.array)).toBe(true)
        expect(isReactive(observed.array[0])).toBe(true)
    })
})
