<template>
  <div id="vue-app-container">
    <!-- Vue 应用占位内容，后续会逐步迁移组件到这里 -->
    <!-- 当前阶段：仅作为占位，确保 Vue 应用可以正常挂载 -->
    
    <!-- Message 组件：显示全局消息提示 -->
    <Message />
    
    <!-- ToolTip 组件：显示工具提示 -->
    <ToolTip />
    
    <!-- Menu 组件：显示右键菜单 -->
    <Menu />
    
    <!-- 主布局容器 -->
    <!-- 当前阶段：占位，后续会逐步迁移视图到这里 -->
    <MainLayout v-if="!showLayoutTest" />
    
    <!-- 布局测试页面 -->
    <LayoutTest v-if="showLayoutTest" @close="showLayoutTest = false" />
   
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted, onUnmounted } from 'vue';
import Message from './components/Message.vue';
import ToolTip from './components/ToolTip.vue';
import Menu from './components/Menu.vue';
import { editorui } from '../global/editorui';

// 使用异步组件加载，避免热更新问题
const MainLayout = defineAsyncComponent(() => import('./layouts/MainLayout.vue'));
const LayoutTest = defineAsyncComponent(() => import('./pages/LayoutTest.vue'));

// 控制布局测试页面的显示
// 可以通过浏览器控制台设置 window.__showLayoutTest() 来显示测试页面
const showLayoutTest = ref(false);

// 监听全局变量，方便在控制台切换
if (typeof window !== 'undefined') {
  (window as any).__showLayoutTest = () => {
    showLayoutTest.value = true;
  };
  (window as any).__hideLayoutTest = () => {
    showLayoutTest.value = false;
  };
}

// 窗口大小调整处理（替代 MainView 的功能）
function handleResize() {
  if (editorui.stage) {
    editorui.stage.setContentSize(window.innerWidth, window.innerHeight);
    
    // 更新 editorui.mainview 的宽高（如果有的话）
    if (editorui.mainview) {
      (editorui.mainview as any).width = editorui.stage.stageWidth;
      (editorui.mainview as any).height = editorui.stage.stageHeight;
    }
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
  // 初始调用一次
  handleResize();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
#vue-app-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* 初始阶段不影响 Egret 的交互 */
  z-index: 1;
}

/* 布局组件需要 pointer-events: auto 才能交互 */
#vue-app-container :deep(.split-panel),
#vue-app-container :deep(.tab-panel),
#vue-app-container :deep(.main-layout),
#vue-app-container :deep(.layout-test-page) {
  pointer-events: auto;
}
</style>

