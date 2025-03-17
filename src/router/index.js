import { createWebHashHistory, createRouter } from 'vue-router'

import Homepage from '../views/Homepage.vue'
import Settings from '../views/Settings.vue'

//代表 URL 地址路径，用来匹配浏览器地址栏中的路径
//对应的component属性指定的组件会被渲染
const routes = [
    { path: '/', component: Homepage },
    { path: '/settingPage', component: Settings },//path是我自己规定的
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;