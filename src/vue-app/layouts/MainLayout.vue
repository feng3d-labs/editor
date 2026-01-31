<template>
  <div class="main-layout">
    <!-- 主布局容器 -->
    <!-- 当前阶段：作为占位，后续会逐步迁移视图到这里 -->
    <div class="layout-placeholder">
      <p>主布局容器</p>
      <p>后续会在这里集成 ProjectView、HierarchyView、InspectorView 等视图</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 主布局组件
// 当前阶段：占位组件，后续会逐步迁移视图
</script>

<style scoped>
.main-layout {
  width: 100%;
  height: 100%;
  position: relative;
  pointer-events: auto;
}

.layout-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #999;
  font-size: 14px;
  text-align: center;
}

.layout-placeholder p {
  margin: 10px 0;
}
</style>

