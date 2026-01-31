<template>
  <div id="vue-app-container">
    <!-- Vue 应用占位内容，后续会逐步迁移组件到这里 -->
    <!-- 当前阶段：仅作为占位，确保 Vue 应用可以正常挂载 -->
    
    <!-- Message 组件：显示全局消息提示 -->
    <Message />
  </div>
</template>

<script setup lang="ts">
import Message from './components/Message.vue';
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
</style>

