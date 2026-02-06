<template>
  <div class="top-view">
    <!-- 菜单栏 -->
    <TopMenuBar />
  </div>
</template>

<script setup lang="ts">
import TopMenuBar from './TopMenuBar.vue';
</script>

<style scoped>
.top-view {
  position: relative;
  width: 100%;
  height: 32px;
  flex-shrink: 0;
  z-index: 1000;
  background-color: var(--editor-background);
  border-bottom: 1px solid var(--sideBar-border);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}
</style>
