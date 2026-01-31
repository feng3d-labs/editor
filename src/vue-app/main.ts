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
// 这会将 Pinia 激活，使得 useEditorStore() 可以在 EditorData 中使用
app.use(pinia);

// 挂载到 DOM
app.mount('#vue-app');

// 导出 pinia 实例，确保在需要时可以访问
export { pinia };

