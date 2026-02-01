<template>
  <div class="top-view">
    <!-- 菜单栏 -->
    <TopMenuBar />
    
    <!-- 工具栏 -->
    <TopToolBar />
  </div>
</template>

<script setup lang="ts">
import TopMenuBar from './TopMenuBar.vue';
import TopToolBar from './TopToolBar.vue';
</script>

<style scoped>
.top-view {
  position: relative;
  width: 100%;
  height: 44px; /* 菜单栏 22px + 工具栏 22px */
  flex-shrink: 0;
  z-index: 1000;
  background-color: var(--el-bg-color, #ffffff);
  border-bottom: 1px solid var(--el-border-color, #e4e7ed);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}
</style>
