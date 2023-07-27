import { createApp } from '../lib/min-vue.esm.js'
import App from './App.js'

const rootContainer = document.getElementById('app')
createApp(App).mount(rootContainer)