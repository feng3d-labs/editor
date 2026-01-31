<!--
  ⚠️ 自定义组件说明：
  此组件保持自定义实现，未使用 Element Plus 的 ElTabs，原因：
  1. 需要与编辑器布局系统深度集成（与 SplitPanel 配合使用）
  2. 需要支持动态标签页（通过 slot 传递内容）
  3. 需要支持标签页关闭功能
  4. 需要自定义样式以匹配编辑器深色主题
  5. 已有完整的实现和测试
  
  如果未来需要替换为 ElTabs，需要：
  - 重新实现标签页关闭功能
  - 调整样式以匹配编辑器主题
  - 修改与 SplitPanel 的集成方式
-->
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
        <Icon
          v-if="tabs.length > 1"
          icon="mdi:close"
          :size="16"
          class="tab-panel-tab-close"
          @click.stop="closeTab(index)"
        />
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
import Icon from './Icon.vue';

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
  /* 使用 Element Plus 主题变量 */
  background-color: var(--el-bg-color, #1e1e1e);
}

.tab-panel-tabs {
  display: flex;
  /* 使用 Element Plus 主题变量 */
  background-color: var(--el-bg-color-overlay, #2d2d2d);
  border-bottom: 1px solid var(--el-border-color, #3d3d3d);
  overflow-x: auto;
  flex-shrink: 0;
}

.tab-panel-tab {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  /* 使用 Element Plus 主题变量 */
  background-color: var(--el-bg-color-overlay, #2d2d2d);
  color: var(--el-text-color-primary, #cccccc);
  cursor: pointer;
  user-select: none;
  border-right: 1px solid var(--el-border-color, #3d3d3d);
  min-width: 100px;
  position: relative;
}

.tab-panel-tab:hover {
  /* 使用 Element Plus 主题变量 */
  background-color: var(--el-fill-color-dark, #3d3d3d);
}

.tab-panel-tab-active {
  /* 使用 Element Plus 主题变量 */
  background-color: var(--el-bg-color, #1e1e1e);
  color: var(--el-text-color-primary, #ffffff);
  border-bottom: 2px solid var(--el-color-primary, #007acc);
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
  /* 使用 Element Plus 主题变量 */
  background-color: var(--el-fill-color-dark, #3d3d3d);
  opacity: 1;
}

.tab-panel-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}
</style>

