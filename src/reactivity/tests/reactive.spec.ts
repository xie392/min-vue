import { reactive } from "../reactive"

describe('reactive', () => {
    it('happy path', () => {
        const original = { foo: 1 }
        const observed = reactive(original)
        expect(observed).not.toBe(original)
        expect(observed.foo).toBe(1)
        // get
        // expect(isReactive(observed)).toBe(true)
        // expect(isReactive(original)).toBe(false)
        // // has
        // expect('foo' in observed).toBe(true)
        // // ownKeys
        // expect(Object.keys(observed)).toEqual(['foo'])

    })

})