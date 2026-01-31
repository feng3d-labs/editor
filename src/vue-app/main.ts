/**
 * Vue 应用入口
 * 与 Egret 应用并行运行
 */
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

// 创建 Pinia 实例
const pinia = createPinia();

// 创建 Vue 应用
const app = createApp(App);

// 使用 Pinia
app.use(pinia);

// 挂载到 DOM
app.mount('#vue-app');

