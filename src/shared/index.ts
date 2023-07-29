export const extend = Object.assign

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