import { reactive } from '../reactive'

describe('reactive', () => {
    it('reactive', () => {
        const user = reactive({
            name: 'baer',
            age: 18
        })

        expect(user.name).toBe('baer')
        expect(user.age).toBe(18)

        user.name = 'baer'
        expect(user.name).toBe('baer')
    })
})
