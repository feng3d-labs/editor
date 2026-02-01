<!--
  TabPanel 组件
  使用 Element Plus 的 Tag 组件优化标签显示
  每个标签支持图标和关闭功能
-->
<template>
  <div class="tab-panel">
    <div class="tab-panel-tabs">
      <el-tag
        v-for="(tab, index) in tabs"
        :key="tab.id"
        :type="index === activeIndex ? 'primary' : 'info'"
        :effect="index === activeIndex ? 'dark' : 'plain'"
        :closable="tabs.length > 1"
        :class="['tab-panel-tag', { 'tab-panel-tag-active': index === activeIndex }]"
        @click="setActiveTab(index)"
        @close="closeTab(index)"
      >
        <Icon
          v-if="getTabIcon(tab)"
          :icon="getTabIcon(tab)"
          :size="14"
          class="tab-panel-tag-icon"
        />
        <span class="tab-panel-tag-label">{{ tab.label }}</span>
      </el-tag>
    </div>
    <div class="tab-panel-content">
      <template
        v-for="(tab, index) in tabs"
        :key="tab.id"
      >
        <div v-show="index === activeIndex" class="tab-panel-content-item">
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

/**
 * 根据标签信息获取合适的图标
 * 如果标签有 icon 属性，直接使用；否则根据 id 或 label 推断
 */
function getTabIcon(tab: Tab): string | undefined {
  // 如果标签有 icon 属性，直接使用
  if (tab.icon) {
    return tab.icon;
  }
  
  // 根据 id 推断图标
  const iconMap: Record<string, string> = {
    hierarchy: 'mdi:file-tree',
    scene: 'mdi:cube-outline',
    project: 'mdi:folder',
    console: 'mdi:console',
    inspector: 'mdi:code-tags',
    tab1: 'mdi:file-document',
    tab2: 'mdi:file-document-outline',
    tab3: 'mdi:file-document-edit',
    tab4: 'mdi:file-document-multiple',
  };
  
  if (iconMap[tab.id]) {
    return iconMap[tab.id];
  }
  
  // 根据 label 推断图标
  const labelLower = tab.label.toLowerCase();
  if (labelLower.includes('层级') || labelLower.includes('hierarchy')) {
    return 'mdi:file-tree';
  }
  if (labelLower.includes('场景') || labelLower.includes('scene')) {
    return 'mdi:cube-outline';
  }
  if (labelLower.includes('项目') || labelLower.includes('project')) {
    return 'mdi:folder';
  }
  if (labelLower.includes('控制台') || labelLower.includes('console')) {
    return 'mdi:console';
  }
  if (labelLower.includes('检查器') || labelLower.includes('inspector')) {
    return 'mdi:code-tags';
  }
  
  // 默认图标
  return 'mdi:file-document-outline';
}

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
  align-items: center;
  gap: 8px;
  padding: 8px;
  /* 使用 Element Plus 主题变量 */
  background-color: var(--el-bg-color-overlay, #2d2d2d);
  border-bottom: 1px solid var(--el-border-color, #3d3d3d);
  overflow-x: auto;
  flex-shrink: 0;
}

.tab-panel-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-panel-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.tab-panel-tag-active {
  font-weight: 500;
}

.tab-panel-tag-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
}

.tab-panel-tag-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.tab-panel-content {
  flex: 1;
  overflow: hidden;
  position: relative;
  min-height: 0; /* 重要：允许 flex 子元素缩小 */
}

.tab-panel-content-item {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>

