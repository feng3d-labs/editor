/**
 * Vue 应用入口
 */
import { createApp } from 'vue';
import App from './App.vue';
import { pinia } from './pinia';

// 配置 Iconify 完全离线模式
// 预加载图标集，完全禁用 API 请求，避免网络连接失败
import { configureOfflineMode, loadIconSets } from './configs/iconify-offline';

// 配置完全离线模式（禁用所有 API 请求）
configureOfflineMode();

// 预加载常用的图标集（异步加载，不阻塞应用启动）
loadIconSets().catch((error) => {
  console.error('[Iconify] 预加载图标集失败:', error);
});

// 引入设计系统样式
import './styles/design-system.css';
// 引入全局主题样式（暗色和亮色）
import './styles/global-dark-theme.css';
import './styles/global-light-theme.css';
// 引入 Element Plus 样式
import 'element-plus/dist/index.css';
// 引入 Element Plus 主题样式（暗色和亮色）
import './styles/element-plus-theme.css';
import './styles/element-plus-light-theme.css';

// 注册 Vue 版本的 objectview 组件
import { registerObjectViewComponents } from './objectview/registerComponents';
registerObjectViewComponents();

// 创建 Vue 应用
const app = createApp(App);

// 使用已创建的 Pinia 实例
// 这会将 Pinia 激活，使得 useEditorStore() 可以在 EditorData 中使用
app.use(pinia);

// 挂载到 DOM
app.mount('#vue-app');

// 初始化主题 Store，应用保存的主题或默认主题
// 在应用挂载后应用主题，确保 DOM 已准备好
import { useThemeStore } from './stores/themeStore';
const themeStore = useThemeStore();
// 确保主题在应用挂载后正确应用
themeStore.applyTheme(themeStore.currentTheme);

// 尝试初始化主题服务，加载并应用保存的主题
import { ThemeService } from './services/ThemeService';
setTimeout(() => {
  const savedThemeId = localStorage.getItem('editor-vscode-theme');
  if (savedThemeId) {
    ThemeService.getInstance().loadAndApplyTheme(savedThemeId).catch(error => {
      console.error('Failed to load saved theme:', error);
    });
  }
}, 100); // 延迟加载以确保DOM已准备就绪

// 初始化国际化 Store
import { useI18nStore } from './stores/i18nStore';
const i18nStore = useI18nStore();
i18nStore.initialize();

// 导出 pinia 实例，确保在需要时可以访问
export { pinia };

