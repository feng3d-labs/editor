<template>
  <div class="tab-panel">
    <div class="tab-panel-tabs">
      <div
        v-for="(tab, index) in tabs"
        :key="tab.id"
        :class="['tab-panel-tab', { 'tab-panel-tab-active': index === activeIndex }]"
        @click="setActiveTab(index)"
      >
        <span class="tab-panel-tab-label">{{ tab.label }}</span>
        <span
          v-if="tabs.length > 1"
          class="tab-panel-tab-close"
          @click.stop="closeTab(index)"
        >
          ×
        </span>
      </div>
    </div>
    <div class="tab-panel-content">
      <template
        v-for="(tab, index) in tabs"
        :key="tab.id"
      >
        <div v-show="index === activeIndex">
          <slot :name="`tab-${tab.id}`"></slot>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Tab } from './TabPanel.types';

interface Props {
  tabs: Tab[];
  defaultActiveIndex?: number;
}

const props = withDefaults(defineProps<Props>(), {
  defaultActiveIndex: 0,
});

const emit = defineEmits<{
  'tab-change': [index: number];
  'tab-close': [index: number];
}>();

const activeIndex = ref(props.defaultActiveIndex);

// 监听 props 变化，更新 activeIndex
watch(() => props.defaultActiveIndex, (newIndex) => {
  if (newIndex !== undefined && newIndex >= 0 && newIndex < props.tabs.length) {
    activeIndex.value = newIndex;
  }
});

// 设置活动标签
function setActiveTab(index: number) {
  if (index >= 0 && index < props.tabs.length) {
    activeIndex.value = index;
    emit('tab-change', index);
  }
}

// 关闭标签
function closeTab(index: number) {
  if (props.tabs.length <= 1) return; // 至少保留一个标签
  
  emit('tab-close', index);
  
  // 如果关闭的是当前活动标签，切换到其他标签
  if (index === activeIndex.value) {
    if (index === props.tabs.length - 1) {
      // 关闭的是最后一个，切换到前一个
      setActiveTab(index - 1);
    } else {
      // 切换到下一个
      setActiveTab(index);
    }
  } else if (index < activeIndex.value) {
    // 关闭的标签在当前标签之前，活动索引需要减1
    activeIndex.value--;
  }
}

// 暴露方法供父组件调用
defineExpose({
  setActiveTab,
  closeTab,
  activeIndex: computed(() => activeIndex.value),
});
</script>

<style scoped>
.tab-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #1e1e1e;
}

.tab-panel-tabs {
  display: flex;
  background-color: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
  overflow-x: auto;
  flex-shrink: 0;
}

.tab-panel-tab {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #2d2d2d;
  color: #cccccc;
  cursor: pointer;
  user-select: none;
  border-right: 1px solid #3d3d3d;
  min-width: 100px;
  position: relative;
}

.tab-panel-tab:hover {
  background-color: #3d3d3d;
}

.tab-panel-tab-active {
  background-color: #1e1e1e;
  color: #ffffff;
  border-bottom: 2px solid #007acc;
}

.tab-panel-tab-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-panel-tab-close {
  margin-left: 8px;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 16px;
  line-height: 1;
  opacity: 0.7;
}

.tab-panel-tab-close:hover {
  background-color: #555555;
  opacity: 1;
}

.tab-panel-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}
</style>

