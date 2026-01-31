<!--
  ⚠️ 自定义组件说明：
  此组件保持自定义实现，未使用 Element Plus 的 ElTooltip，原因：
  1. 需要与 Egret 代码兼容（通过全局事件 tooltip.show/tooltip.hide 触发）
  2. 需要动态位置计算（跟随鼠标位置）
  3. 需要支持 Egret DisplayObject 的 tooltip 注册机制
  4. 已有适配层（ToolTipAdapter）与旧代码桥接
  
  如果未来需要替换为 ElTooltip，需要：
  - 修改所有 Egret 代码的 tooltip 触发方式
  - 实现动态位置计算
  - 移除 ToolTipAdapter 适配层
-->
<template>
  <Teleport to="body">
    <div
      v-if="tooltip.visible"
      class="tooltip-container"
      :style="tooltipStyle"
    >
      <div class="tooltip-content">
        {{ tooltip.text }}
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { globalEmitter, IEvent } from 'feng3d';

interface TooltipData {
  visible: boolean;
  text: string;
  x: number;
  y: number;
}

const tooltip = ref<TooltipData>({
  visible: false,
  text: '',
  x: 0,
  y: 0,
});

// 计算工具提示样式
const tooltipStyle = computed(() => {
  if (!tooltip.value.visible) return {};
  
  return {
    left: `${tooltip.value.x}px`,
    top: `${tooltip.value.y}px`,
  };
});

// 显示工具提示
function showTooltip(event: IEvent<{ text: string; x: number; y: number }>) {
  const { text, x, y } = event.data;
  tooltip.value = {
    visible: true,
    text: String(text),
    x,
    y: y - 30, // 在鼠标上方显示
  };
}

// 隐藏工具提示
function hideTooltip() {
  tooltip.value.visible = false;
}

onMounted(() => {
  globalEmitter.on('tooltip.show', showTooltip);
  globalEmitter.on('tooltip.hide', hideTooltip);
});

onUnmounted(() => {
  globalEmitter.off('tooltip.show', showTooltip);
  globalEmitter.off('tooltip.hide', hideTooltip);
});
</script>

<style scoped>
.tooltip-container {
  position: fixed;
  z-index: 10001;
  pointer-events: none;
  user-select: none;
}

.tooltip-content {
  background-color: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  max-width: 300px;
  word-wrap: break-word;
  white-space: normal;
}
</style>

