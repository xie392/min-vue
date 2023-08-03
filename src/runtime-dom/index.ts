import { createReander } from '../runtime-core'

function createElement(type) {
    return document.createElement(type)
}

function patchProps(el, key, prevVal, nextVal) {
    const isOn = (key) => /^on[A-Z]/.test(key)
    // 事件
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase()
        el.addEventListener(event, nextVal)
    } else {
        if (nextVal == null || nextVal == undefined) {
            el.removeAttribute(key)
        } else {
            el.setAttribute(key, nextVal)
        }
    }
}

function insert(el, parent) {
    parent.appendChild(el)
}

function remove(el) {
    const parent = el.parentNode
    if (parent) {
        parent.removeChild(el)
    }
}

function setElement(el,text) {
    el.textContent = text
}

const render: any = createReander({
    createElement,
    patchProps,
    insert,
    remove,
    setElement
})

export function createApp(...args) {
    return render.createApp(...args)
}

export * from '../runtime-core'
