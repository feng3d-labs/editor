<template>
  <div class="main-layout">
    <!-- 主布局：水平分割 -->
    <SplitPanel direction="horizontal" :split="0.2" :min-size="150">
      <!-- 左侧：ProjectView 和 HierarchyView -->
      <template #first>
        <TabPanel :tabs="leftTabs" :default-active-index="0" @tab-change="onLeftTabChange">
          <template #tab-project>
            <ProjectView />
          </template>
          <template #tab-hierarchy>
            <HierarchyView />
          </template>
        </TabPanel>
      </template>
      
      <!-- 右侧：SceneView 和 InspectorView -->
      <template #second>
        <SplitPanel direction="vertical" :split="0.7" :min-size="200">
          <!-- 上方：SceneView -->
          <template #first>
            <TabPanel :tabs="mainTabs" :default-active-index="0" @tab-change="onMainTabChange">
              <template #tab-scene>
                <SceneView />
              </template>
            </TabPanel>
          </template>
          
          <!-- 下方：InspectorView 和 Console -->
          <template #second>
            <TabPanel :tabs="bottomTabs" :default-active-index="0" @tab-change="onBottomTabChange">
              <template #tab-inspector>
                <InspectorView />
              </template>
              <template #tab-console>
                <div class="panel-placeholder">
                  <p>Console（待迁移）</p>
                </div>
              </template>
            </TabPanel>
          </template>
        </SplitPanel>
      </template>
    </SplitPanel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SplitPanel from '../components/SplitPanel.vue';
import TabPanel from '../components/TabPanel.vue';
import type { Tab } from '../components/TabPanel.types';
import ProjectView from '../views/ProjectView.vue';
import HierarchyView from '../views/HierarchyView.vue';
import InspectorView from '../views/InspectorView.vue';
import SceneView from '../views/SceneView.vue';

// 左侧标签页
const leftTabs = ref<Tab[]>([
  { id: 'project', label: '项目' },
  { id: 'hierarchy', label: '层级' },
]);

// 主标签页
const mainTabs = ref<Tab[]>([
  { id: 'scene', label: '场景' },
]);

// 底部标签页
const bottomTabs = ref<Tab[]>([
  { id: 'inspector', label: '检查器' },
  { id: 'console', label: '控制台' },
]);

// 标签切换处理（可选，用于保存状态等）
function onLeftTabChange(index: number) {
  // TODO: 可以保存标签状态
}

function onMainTabChange(index: number) {
  // TODO: 可以保存标签状态
}

function onBottomTabChange(index: number) {
  // TODO: 可以保存标签状态
}
</script>

<style scoped>
.main-layout {
  width: 100%;
  height: 100%;
  position: relative;
  pointer-events: auto;
  /* 使用 Element Plus 主题变量 */
  background-color: var(--el-bg-color, #1e1e1e);
}

.panel-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  /* 使用 Element Plus 主题变量 */
  color: var(--el-text-color-secondary, #666666);
  font-size: 14px;
  text-align: center;
}

.panel-placeholder p {
  margin: 10px 0;
}
</style>

