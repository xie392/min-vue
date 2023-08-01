const { createApp, h, version, watchEffect, ref } = Vue

const App = {
    setup() {
        const count = ref(0)

        const stop = watchEffect(
            () => {
                console.log('watchEffect: count is: ', count.value)
            },
            {
                // watchEffect的配置项
                onTrack(e) {
                    console.log('收集依赖: onTrack: ', e)
                },
                onTrigger(e) {
                    console.log('触发依赖: onTrigger: ', e)
                }
            }
        )

        count.value++
        return {
            msg: 'Hello World',
            count
        }
    },
    render() {
        return h('div', [
            h('h1', this.msg),
            h('p', `count is: ${this.count}`),
            h(
                'button',
                {
                    onClick: () => {
                        this.count++
                    }
                },
                'click me'
            )
        ])
    }
}

const app = createApp(App)

console.log('app-config: ', app.config)
console.log('app-config-globalProperties: ', app.config.globalProperties)
console.log('vue-version: ', version)

app.mount('#app')
