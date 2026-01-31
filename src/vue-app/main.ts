/**
 * Vue 应用入口
 * 与 Egret 应用并行运行
 */
import { createApp } from 'vue';
import App from './App.vue';
import { pinia } from './pinia';

// 创建 Vue 应用
const app = createApp(App);

// 使用已创建的 Pinia 实例
app.use(pinia);

// 挂载到 DOM
app.mount('#vue-app');

