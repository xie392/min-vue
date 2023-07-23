import { log } from 'console'

describe('map', () => {
    it('map test', () => {
        const obj = { foo: 1 }

        const map = new Map()

        let dummy = new Map()
        // 将副作用函数和响应式数据关联起来
        map.set(obj, obj)

        log('set map:', map)
        log('get map:', map.get(obj))
    })
})
