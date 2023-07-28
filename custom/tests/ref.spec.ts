import { ref, isRef } from '../ref'

describe('ref', () => {
    it('ref', () => {
        const a = ref(1)
        expect(a.value).toBe(1)
        
        a.value = 2
        expect(a.value).toBe(2)

        const b = 1
        expect(isRef(a)).toBe(true)
        expect(isRef(b)).toBe(false)
    })
})
