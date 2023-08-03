export const extend = Object.assign

export const EMPTY_OBJ = {}

/**
 * 判断是否是对象
 * @param val
 * @returns
 */
export function isObject(val) {
    return val !== null && typeof val === 'object'
}

/**
 * 判断两个值是否相等
 * @param oldValue  旧值
 * @param newValue  新值
 * @returns
 */
export const hasChanged = (oldValue, newValue) => !Object.is(oldValue, newValue)

export const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key) 

export const camelized = (str: string) => {
    return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
}

export const capitalized = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export const toHandlerKey = (str: string) => {
    return str ? `on${capitalized(str)}` : ''
}


export const isArray = Array.isArray
