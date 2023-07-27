/**
 * 创建虚拟节点
 * @param type          节点类型
 * @param props         节点属性
 * @param children      子节点
 * @returns 
 */
export function createVNode(type, props?, children?) {
    return {
        type,
        props,
        children
    }
}
