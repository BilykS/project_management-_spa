import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import Toast, { type PluginOptions, POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import router from './router'
import App from './App.vue'
import './assets/styles/global.scss'
import { vResizeColumn } from './directives/vResizeColumn'

const toastOptions: PluginOptions = {
  position: POSITION.TOP_RIGHT,
  timeout: 3500,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
  hideProgressBar: false,
  maxToasts: 5,
  newestOnTop: true,
}

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(Toast, toastOptions)
app.directive('resize-column', vResizeColumn)

app.mount('#app')
