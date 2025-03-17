import { createApp } from 'vue'
//import './style.css'
import App from './App.vue'
import router from './router'

//应用的入口，负责启动和配置应用

const app = createApp(App);
app.use(router);
app.mount("#app");
