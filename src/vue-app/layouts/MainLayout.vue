<template>
  <div class="main-layout">
    <!-- 顶部菜单栏和工具栏 -->
    <div class="top-bar-container">
      <TopMenuBar />
      <TopToolBar />
    </div>
    
    <!-- 主布局：水平分割（左侧：Hierarchy + Scene + Project，右侧：Inspector） -->
    <div class="main-content">
      <SplitPanel direction="horizontal" :split="0.82" :min-size="200">
      <!-- 左侧：Hierarchy + Scene + Project -->
      <template #first>
        <SplitPanel direction="vertical" :split="0.64" :min-size="200">
          <!-- 上方：Hierarchy + Scene -->
          <template #first>
            <SplitPanel direction="horizontal" :split="0.17" :min-size="150">
              <!-- 左侧：Hierarchy -->
              <template #first>
                <TabPanel :tabs="hierarchyTabs" :default-active-index="0" @tab-change="onHierarchyTabChange">
                  <template #tab-hierarchy>
                    <HierarchyView />
                  </template>
                </TabPanel>
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
          
          <!-- 下方：Project -->
          <template #second>
            <TabPanel :tabs="projectTabs" :default-active-index="0" @tab-change="onProjectTabChange">
              <template #tab-project>
                <ProjectView />
              </template>
            </TabPanel>
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
import TopToolBar from '../components/TopToolBar.vue';

// 层级标签页
const hierarchyTabs = ref<Tab[]>([
  { id: 'hierarchy', label: '层级' },
]);

// 场景标签页
const mainTabs = ref<Tab[]>([
  { id: 'scene', label: '场景' },
]);

// 项目标签页
const projectTabs = ref<Tab[]>([
  { id: 'project', label: '项目' },
]);

// 底部标签页
const bottomTabs = ref<Tab[]>([
  { id: 'inspector', label: '检查器' },
  { id: 'console', label: '控制台' },
]);

// 标签切换处理（可选，用于保存状态等）
function onHierarchyTabChange(index: number) {
  // TODO: 可以保存标签状态
}

function onMainTabChange(index: number) {
  // TODO: 可以保存标签状态
}

function onProjectTabChange(index: number) {
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

.top-bar-container {
  position: relative;
  width: 100%;
  height: 44px; /* 菜单栏 22px + 工具栏 22px */
  flex-shrink: 0;
  z-index: 1000;
  background-color: var(--el-bg-color, #ffffff);
  border-bottom: 1px solid var(--el-border-color, #e4e7ed);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
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

