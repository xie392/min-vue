import { getCurrentInstance } from './component'

export function provider(key, value) {
    const currentInstance: any = getCurrentInstance()

    if (currentInstance) {
        let { providers, parent } = currentInstance
        const parentProviders = parent?.providers ?? {}

        if (providers === parentProviders) {
            providers = currentInstance.providers = Object.create(parentProviders || null)
        }

        providers[key] = value
    }
}

export function inject(key, defaultValue) {
    const currentInstance: any = getCurrentInstance()

    if (currentInstance) {
        const parentProviders = currentInstance.parent.providers

        if (key in parentProviders) {
            return parentProviders[key]
        } else {
            if(typeof defaultValue === 'function') {
                return defaultValue()
            }
            return defaultValue
        }
    }
}
