import { createApp } from 'vue'
//import './style.css'
import App from './App.vue'
import router from './router'

//Ӧ�õ���ڣ���������������Ӧ��

const app = createApp(App);
app.use(router);
app.mount("#app");
