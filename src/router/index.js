import { createWebHashHistory, createRouter } from 'vue-router'

import Homepage from '../views/Homepage.vue'
import Settings from '../views/Settings.vue'

//���� URL ��ַ·��������ƥ���������ַ���е�·��
//��Ӧ��component����ָ��������ᱻ��Ⱦ
const routes = [
    { path: '/', component: Homepage },
    { path: '/settingPage', component: Settings },//path�����Լ��涨��
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;