import { createReander } from '../runtime-core'

function createElement(type) {
    return document.createElement(type)
}

function patchProps(el, key, val) {
    const isOn = (key) => /^on[A-Z]/.test(key)
    // 事件
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase()
        el.addEventListener(event, val)
    } else {
        el.setAttribute(key, val)
    }
}

function insert(el, parent) {
    parent.appendChild(el)
}

const render: any = createReander({
    createElement,
    patchProps,
    insert
})

export function createApp(...args) {
    return render.createApp(...args)
}

export * from '../runtime-core'
