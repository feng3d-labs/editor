<template>
  <div class="split-panel" :class="{ 'split-panel-horizontal': direction === 'horizontal', 'split-panel-vertical': direction === 'vertical' }">
    <div
      ref="firstPanelRef"
      class="split-panel-first"
      :style="firstPanelStyle"
    >
      <slot name="first"></slot>
    </div>
    <div
      ref="splitterRef"
      class="split-panel-splitter"
      :class="{ 'split-panel-splitter-horizontal': direction === 'horizontal', 'split-panel-splitter-vertical': direction === 'vertical' }"
      @mousedown="onSplitterMouseDown"
    ></div>
    <div
      ref="secondPanelRef"
      class="split-panel-second"
      :style="secondPanelStyle"
    >
      <slot name="second"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';

interface Props {
  direction?: 'horizontal' | 'vertical';
  split?: number; // 分割比例 0-1，默认 0.5
  minSize?: number; // 最小尺寸（像素）
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'horizontal',
  split: 0.5,
  minSize: 100,
});

const emit = defineEmits<{
  'update:split': [value: number];
}>();

const firstPanelRef = ref<HTMLElement>();
const secondPanelRef = ref<HTMLElement>();
const splitterRef = ref<HTMLElement>();
const currentSplit = ref(props.split);
const isDragging = ref(false);
const startPosition = ref(0);
const startSplit = ref(0);

// 计算第一个面板的样式
const firstPanelStyle = computed(() => {
  if (props.direction === 'horizontal') {
    return {
      width: `${currentSplit.value * 100}%`,
      height: '100%',
    };
  } else {
    return {
      width: '100%',
      height: `${currentSplit.value * 100}%`,
    };
  }
});

// 计算第二个面板的样式
const secondPanelStyle = computed(() => {
  if (props.direction === 'horizontal') {
    return {
      width: `${(1 - currentSplit.value) * 100}%`,
      height: '100%',
    };
  } else {
    return {
      width: '100%',
      height: `${(1 - currentSplit.value) * 100}%`,
    };
  }
});

// 分割条鼠标按下
function onSplitterMouseDown(event: MouseEvent) {
  event.preventDefault();
  isDragging.value = true;
  
  if (props.direction === 'horizontal') {
    startPosition.value = event.clientX;
  } else {
    startPosition.value = event.clientY;
  }
  
  startSplit.value = currentSplit.value;
  
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
  document.body.style.cursor = props.direction === 'horizontal' ? 'col-resize' : 'row-resize';
  document.body.style.userSelect = 'none';
}

// 鼠标移动
function onMouseMove(event: MouseEvent) {
  if (!isDragging.value || !firstPanelRef.value?.parentElement) return;
  
  const container = firstPanelRef.value.parentElement;
  const containerSize = props.direction === 'horizontal' 
    ? container.clientWidth 
    : container.clientHeight;
  
  const delta = props.direction === 'horizontal'
    ? event.clientX - startPosition.value
    : event.clientY - startPosition.value;
  
  const deltaRatio = delta / containerSize;
  let newSplit = startSplit.value + deltaRatio;
  
  // 限制最小尺寸
  const minRatio = props.minSize / containerSize;
  newSplit = Math.max(minRatio, Math.min(1 - minRatio, newSplit));
  
  currentSplit.value = newSplit;
  emit('update:split', newSplit);
}

// 鼠标释放
function onMouseUp() {
  isDragging.value = false;
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
}

// 监听 split prop 变化
watch(() => props.split, (newValue) => {
  currentSplit.value = newValue;
});

onUnmounted(() => {
  if (isDragging.value) {
    onMouseUp();
  }
});
</script>

<style scoped>
.split-panel {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
}

.split-panel-horizontal {
  flex-direction: row;
}

.split-panel-vertical {
  flex-direction: column;
}

.split-panel-first,
.split-panel-second {
  overflow: hidden;
  position: relative;
}

.split-panel-splitter {
  background-color: #2d2d2d;
  position: relative;
  flex-shrink: 0;
  z-index: 10;
}

.split-panel-splitter-horizontal {
  width: 4px;
  cursor: col-resize;
}

.split-panel-splitter-vertical {
  height: 4px;
  cursor: row-resize;
}

.split-panel-splitter:hover {
  background-color: #3d3d3d;
}

.split-panel-splitter-horizontal:hover {
  background-color: #3d3d3d;
}

.split-panel-splitter-vertical:hover {
  background-color: #3d3d3d;
}
</style>

