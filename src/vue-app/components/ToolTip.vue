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

