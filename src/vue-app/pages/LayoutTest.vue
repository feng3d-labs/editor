<template>
  <div class="layout-test-page">
    <div class="test-header">
      <h1>布局组件测试页面</h1>
      <button @click="closeTest" class="close-button">关闭</button>
    </div>

    <div class="test-content">
      <!-- SplitPanel 水平分割演示 -->
      <div class="test-section">
        <h2>SplitPanel - 水平分割</h2>
        <SplitPanel
          v-model:split="horizontalSplit"
          direction="horizontal"
          :min-size="150"
          class="test-split-panel"
        >
          <template #first>
            <div class="panel-content left-panel">
              <h3>左侧面板</h3>
              <p>这是左侧面板的内容</p>
              <p>可以拖拽中间的分割条来调整大小</p>
              <p>当前分割比例: {{ (horizontalSplit * 100).toFixed(1) }}%</p>
              <div class="test-box">测试内容区域</div>
            </div>
          </template>
          <template #second>
            <div class="panel-content right-panel">
              <h3>右侧面板</h3>
              <p>这是右侧面板的内容</p>
              <p>支持最小尺寸限制（150px）</p>
              <div class="test-box">测试内容区域</div>
            </div>
          </template>
        </SplitPanel>
      </div>

      <!-- SplitPanel 垂直分割演示 -->
      <div class="test-section">
        <h2>SplitPanel - 垂直分割</h2>
        <SplitPanel
          v-model:split="verticalSplit"
          direction="vertical"
          :min-size="100"
          class="test-split-panel"
        >
          <template #first>
            <div class="panel-content top-panel">
              <h3>上方面板</h3>
              <p>这是上方面板的内容</p>
              <p>垂直分割示例</p>
            </div>
          </template>
          <template #second>
            <div class="panel-content bottom-panel">
              <h3>下方面板</h3>
              <p>这是下方面板的内容</p>
              <p>当前分割比例: {{ (verticalSplit * 100).toFixed(1) }}%</p>
            </div>
          </template>
        </SplitPanel>
      </div>

      <!-- TabPanel 演示 -->
      <div class="test-section">
        <h2>TabPanel - 标签页</h2>
        <TabPanel
          :tabs="tabs"
          :default-active-index="0"
          @tab-change="onTabChange"
          @tab-close="onTabClose"
          class="test-tab-panel"
        >
          <template #tab-tab1>
            <div class="tab-content">
              <h3>标签页 1</h3>
              <p>这是第一个标签页的内容</p>
              <p>可以点击标签来切换</p>
            </div>
          </template>
          <template #tab-tab2>
            <div class="tab-content">
              <h3>标签页 2</h3>
              <p>这是第二个标签页的内容</p>
              <p>支持多个标签页</p>
            </div>
          </template>
          <template #tab-tab3>
            <div class="tab-content">
              <h3>标签页 3</h3>
              <p>这是第三个标签页的内容</p>
              <p>可以点击 × 关闭标签</p>
            </div>
          </template>
          <template #tab-tab4>
            <div class="tab-content">
              <h3>标签页 4</h3>
              <p>这是第四个标签页的内容</p>
              <p>测试关闭功能</p>
            </div>
          </template>
        </TabPanel>
      </div>

      <!-- 组合使用演示 -->
      <div class="test-section">
        <h2>组合使用 - SplitPanel + TabPanel</h2>
        <SplitPanel
          v-model:split="combinedSplit"
          direction="horizontal"
          :min-size="200"
          class="test-split-panel"
        >
          <template #first>
            <TabPanel
              :tabs="leftTabs"
              :default-active-index="0"
              class="test-tab-panel"
            >
              <template #tab-left1>
                <div class="tab-content">
                  <h4>左侧标签 1</h4>
                  <p>左侧面板中的标签页</p>
                </div>
              </template>
              <template #tab-left2>
                <div class="tab-content">
                  <h4>左侧标签 2</h4>
                  <p>另一个标签页</p>
                </div>
              </template>
            </TabPanel>
          </template>
          <template #second>
            <TabPanel
              :tabs="rightTabs"
              :default-active-index="0"
              class="test-tab-panel"
            >
              <template #tab-right1>
                <div class="tab-content">
                  <h4>右侧标签 1</h4>
                  <p>右侧面板中的标签页</p>
                </div>
              </template>
              <template #tab-right2>
                <div class="tab-content">
                  <h4>右侧标签 2</h4>
                  <p>另一个标签页</p>
                </div>
              </template>
            </TabPanel>
          </template>
        </SplitPanel>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SplitPanel from '../components/SplitPanel.vue';
import TabPanel from '../components/TabPanel.vue';
import type { Tab } from '../components/TabPanel.types';

const emit = defineEmits<{
  'close': [];
}>();

const horizontalSplit = ref(0.5);
const verticalSplit = ref(0.4);
const combinedSplit = ref(0.4);

const tabs = ref<Tab[]>([
  { id: 'tab1', label: '标签页 1' },
  { id: 'tab2', label: '标签页 2' },
  { id: 'tab3', label: '标签页 3' },
  { id: 'tab4', label: '标签页 4' },
]);

const leftTabs = ref<Tab[]>([
  { id: 'left1', label: '左侧 1' },
  { id: 'left2', label: '左侧 2' },
]);

const rightTabs = ref<Tab[]>([
  { id: 'right1', label: '右侧 1' },
  { id: 'right2', label: '右侧 2' },
]);

function onTabChange(index: number) {
  console.log('切换到标签页:', index, tabs.value[index]?.label);
}

function onTabClose(index: number) {
  console.log('关闭标签页:', index, tabs.value[index]?.label);
  if (tabs.value.length > 1) {
    tabs.value.splice(index, 1);
  }
}

function closeTest() {
  emit('close');
}
</script>

<style scoped>
.layout-test-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #1e1e1e;
  color: #cccccc;
  overflow-y: auto;
  z-index: 2000;
  pointer-events: auto;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
  position: sticky;
  top: 0;
  z-index: 10;
}

.test-header h1 {
  margin: 0;
  color: #ffffff;
  font-size: 20px;
}

.close-button {
  padding: 8px 16px;
  background-color: #007acc;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.close-button:hover {
  background-color: #0098ff;
}

.test-content {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 40px;
}

.test-section h2 {
  margin-bottom: 15px;
  color: #ffffff;
  font-size: 18px;
  border-bottom: 2px solid #007acc;
  padding-bottom: 8px;
}

.test-split-panel {
  height: 300px;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
  overflow: hidden;
}

.test-tab-panel {
  height: 300px;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
  overflow: hidden;
}

.panel-content {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.left-panel {
  background-color: #252526;
}

.right-panel {
  background-color: #1e1e1e;
}

.top-panel {
  background-color: #252526;
}

.bottom-panel {
  background-color: #1e1e1e;
}

.panel-content h3 {
  margin-top: 0;
  color: #ffffff;
  font-size: 16px;
}

.panel-content p {
  margin: 10px 0;
  line-height: 1.6;
}

.test-box {
  margin-top: 20px;
  padding: 15px;
  background-color: #2d2d2d;
  border-radius: 4px;
  border: 1px solid #3d3d3d;
}

.tab-content {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.tab-content h3,
.tab-content h4 {
  margin-top: 0;
  color: #ffffff;
}

.tab-content p {
  margin: 10px 0;
  line-height: 1.6;
}
</style>

