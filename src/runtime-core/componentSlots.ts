import { ShapeFlags } from '../shared/ShapeFlags'
import { isArray } from '../shared/index'

export function initSlots(instance, children) {
    if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
        instance.slots = normalizeSlotObject(children)
    }
}

function normalizeSlotValue(value) {
    return isArray(value) ? value : [value]
}

function normalizeSlotObject(children: any) {
    const slots = {}
    for (const key in children) {
        const val = children[key]
        slots[key] = (props) => normalizeSlotValue(val(props))
    }

    return slots
}
