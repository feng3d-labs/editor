<template>
  <div class="main-layout">
    <!-- 顶部菜单栏 -->
    <TopMenuBar />
    
    <!-- 主布局：水平分割（左侧：Hierarchy + Scene + Project，右侧：Inspector） -->
    <div class="main-content">
      <SplitPanel direction="horizontal" :split="0.82" :min-size="200">
      <!-- 左侧：Hierarchy + Scene + Project -->
      <template #first>
        <SplitPanel direction="vertical" :split="0.64" :min-size="200">
          <!-- 上方：Hierarchy + Scene -->
          <template #first>
            <SplitPanel direction="horizontal" :split="0.17" :min-size="150">
              <!-- 左侧：Hierarchy（仅显示层级） -->
              <template #first>
                <HierarchyView />
              </template>
              
              <!-- 右侧：Scene -->
              <template #second>
                <TabPanel :tabs="mainTabs" :default-active-index="0" @tab-change="onMainTabChange">
                  <template #tab-scene>
                    <SceneView />
                  </template>
                </TabPanel>
              </template>
            </SplitPanel>
          </template>
          
          <!-- 下方：Project（仅显示项目） -->
          <template #second>
            <ProjectView />
          </template>
        </SplitPanel>
      </template>
      
      <!-- 右侧：Inspector -->
      <template #second>
        <TabPanel :tabs="bottomTabs" :default-active-index="0" @tab-change="onBottomTabChange">
          <template #tab-inspector>
            <InspectorView />
          </template>
          <template #tab-console>
            <ConsoleView />
          </template>
        </TabPanel>
      </template>
      </SplitPanel>
    </div>
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
import ConsoleView from '../views/ConsoleView.vue';
import TopMenuBar from '../components/TopMenuBar.vue';

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
  display: flex;
  flex-direction: column;
  /* 使用 Element Plus 主题变量 */
  background-color: var(--el-bg-color, #1e1e1e);
}

.main-content {
  flex: 1;
  min-height: 0;
  position: relative;
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

