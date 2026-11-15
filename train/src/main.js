import { createApp } from 'vue'
import App from './App.vue'

// The browser only allows Web Crypto (needed to decrypt the API key) on secure
// pages. platycore.com also answers on plain http://, so switch to https://.
// (localhost counts as secure, so dev servers are unaffected.)
if (!window.isSecureContext && location.protocol === 'http:') {
  location.replace('https://' + location.host + location.pathname + location.search + location.hash)
} else {
  createApp(App).mount('#app')
}
