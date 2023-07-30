import { camelized, toHandlerKey } from "../shared/index"

export function emit(instance, event, ...args) {
    const { props } = instance

    const handlerName = toHandlerKey(camelized(event))

    const handler = props[handlerName]

    handler && handler(...args)
}
