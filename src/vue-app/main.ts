/**
 * Vue 应用入口
 * 与 Egret 应用并行运行
 */
import { createApp } from 'vue';
import App from './App.vue';
import { pinia } from './pinia';

// 引入全局暗色主题（必须在最前面）
import './styles/global-dark-theme.css';
// 引入 Element Plus 样式
import 'element-plus/dist/index.css';
// 引入自定义深色主题
import './styles/element-plus-theme.css';

// 创建 Vue 应用
const app = createApp(App);

// 使用已创建的 Pinia 实例
// 这会将 Pinia 激活，使得 useEditorStore() 可以在 EditorData 中使用
app.use(pinia);

// 挂载到 DOM
app.mount('#vue-app');

// 导出 pinia 实例，确保在需要时可以访问
export { pinia };

