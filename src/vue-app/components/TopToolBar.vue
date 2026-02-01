<template>
  <div class="top-tool-bar">
    <!-- 左侧：工具组 -->
    <div class="tool-section tool-section-left">
      <!-- 工具组：移动、旋转、缩放 -->
      <div class="tool-group">
        <button
          :class="['tool-button', 'toggle-button', { 'is-selected': toolType === MRSToolType.MOVE }]"
          @click="onMoveClick"
          :title="t('toolbar.move')"
        >
          <Icon icon="mdi:cursor-move" :size="18" />
        </button>
        <button
          :class="['tool-button', 'toggle-button', { 'is-selected': toolType === MRSToolType.ROTATION }]"
          @click="onRotateClick"
          :title="t('toolbar.rotate')"
        >
          <Icon icon="mdi:rotate-3d-variant" :size="18" />
        </button>
        <button
          :class="['tool-button', 'toggle-button', { 'is-selected': toolType === MRSToolType.SCALE }]"
          @click="onScaleClick"
          :title="t('toolbar.scale')"
        >
          <Icon icon="mdi:arrow-expand-all" :size="18" />
        </button>
      </div>
      
      <!-- 分隔线 -->
      <div class="divider"></div>
      
      <!-- 工具组：Pivot/Center、Local/World -->
      <div class="tool-group">
        <button
          :class="['tool-button', 'toggle-button', 'center-world-button', { 'is-selected': isBaryCenter }]"
          @click="onCenterClick"
          :title="t('toolbar.pivotCenter')"
        >
          <Icon v-if="!isBaryCenter" icon="mdi:crosshairs-gps" :size="18" />
          <Icon v-else icon="mdi:vector-point" :size="18" />
        </button>
        <button
          :class="['tool-button', 'toggle-button', 'center-world-button', { 'is-selected': !isWoldCoordinate }]"
          @click="onWorldClick"
          :title="t('toolbar.localWorld')"
        >
          <Icon v-if="isWoldCoordinate" icon="mdi:earth" :size="18" />
          <Icon v-else icon="mdi:axis-arrow" :size="18" />
        </button>
      </div>
    </div>

    <!-- 中间：播放按钮 -->
    <div class="tool-section tool-section-center">
      <div class="play-button-container">
        <button
          class="tool-button play-button"
          @mousedown.stop="handlePlayMouseDown"
          @mouseup.stop="handlePlayMouseUp"
          @mouseleave="isPlayPressed = false"
          :title="t('toolbar.play')"
          type="button"
        >
          <Icon icon="mdi:play" :size="18" />
        </button>
      </div>
    </div>

    <!-- 右侧：工具按钮 -->
    <div class="tool-section tool-section-right">
      <!-- 工具组：帮助、二维码、设置 -->
      <div class="tool-group">
        <button
          class="tool-button"
          @click="onHelpClick"
          :title="t('toolbar.help')"
        >
          <Icon icon="mdi:help-circle" :size="18" />
        </button>
        <button
          class="tool-button"
          @click="onQRCodeClick"
          :title="t('toolbar.qrcode')"
        >
          <Icon icon="mdi:qrcode" :size="18" />
        </button>
        <button
          class="tool-button"
          @click="onSettingClick"
          :title="t('toolbar.settings')"
        >
          <Icon icon="mdi:cog" :size="18" />
        </button>
      </div>
    </div>
    
    <!-- 设置对话框 -->
    <SettingsDialog v-model="settingsDialogVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { globalEmitter, FS, FSType, serialization } from 'feng3d';
import { EditorData, MRSToolType } from '../../global/EditorData';
import { editorRS } from '../../assets/EditorRS';
import { editorcache } from '../../caches/Editorcache';
import { showQRCode } from '../../utils/QRCode';
import { useEditorStore } from '../stores/editorStore';
import { closeRunWindow, setRunWindow, getRunWindow } from '../utils/runWindowManager';
import { useI18n } from '../composables/useI18n';
import Icon from './Icon.vue';
import SettingsDialog from './SettingsDialog.vue';

const editorStore = useEditorStore();
const { t } = useI18n();

// 工具类型状态
const toolType = computed(() => editorStore.toolType);
const isBaryCenter = computed(() => editorStore.isBaryCenter);
const isWoldCoordinate = computed(() => editorStore.isWoldCoordinate);

// 设置对话框显示状态
const settingsDialogVisible = ref(false);

// 播放按钮按下状态
const isPlayPressed = ref(false);
let playButtonMouseDownTime = 0;

// 工具按钮点击处理
function onMoveClick() {
  editorStore.setToolType(MRSToolType.MOVE);
}

function onRotateClick() {
  editorStore.setToolType(MRSToolType.ROTATION);
}

function onScaleClick() {
  editorStore.setToolType(MRSToolType.SCALE);
}

function onCenterClick() {
  editorStore.setIsBaryCenter(!editorStore.isBaryCenter);
}

function onWorldClick() {
  editorStore.setIsWoldCoordinate(!editorStore.isWoldCoordinate);
}

// 播放按钮事件处理
function handlePlayMouseDown(event: MouseEvent) {
  isPlayPressed.value = true;
  playButtonMouseDownTime = Date.now();
}

function handlePlayMouseUp(event: MouseEvent) {
  isPlayPressed.value = false;
  
  // 如果 mousedown 和 mouseup 时间间隔很短（< 500ms），认为是点击
  const timeDiff = Date.now() - playButtonMouseDownTime;
  if (timeDiff < 500 && timeDiff > 0) {
    onPlayClick();
  }
}

// 播放按钮点击处理
async function onPlayClick() {
  // 定义播放逻辑
  const playAction = async () => {
    try {
      // 检查场景是否存在
      if (!EditorData.editorData.gameScene || !EditorData.editorData.gameScene.gameObject) {
        console.error(t('message.gameSceneNotFound'));
        return;
      }
      
      // 序列化并保存场景
      const obj = serialization.serialize(EditorData.editorData.gameScene.gameObject);
      await editorRS.fs.writeObject('default.scene.json', obj);
      
      // 根据文件系统类型打开运行窗口
      closeRunWindow();
      let newWindow: Window | null = null;
      
      if (editorRS.fs.type === FSType.indexedDB) {
        newWindow = window.open(`run.html?fstype=${FS.fs.type}&project=${editorcache.projectname}`);
      } else {
        const path = editorRS.fs.getAbsolutePath('index.html');
        newWindow = window.open(path);
      }
      
      if (newWindow) {
        setRunWindow(newWindow);
      } else {
        console.error(t('message.cannotOpenRunWindow'));
      }
    } catch (error) {
      console.error(t('message.playFailed'), error);
    }
  };
  
  // 触发保存事件，InspectorView 会在保存完成后调用回调
  globalEmitter.emit('inspector.saveShowData', playAction);
  
  // 回退机制：如果 InspectorView 没有处理事件，直接执行播放逻辑
  setTimeout(async () => {
    if (!getRunWindow()) {
      await playAction();
    }
  }, 50);
}

// 帮助和设置按钮
function onHelpClick() {
  window.open('https://feng3d.com/');
}

function onSettingClick() {
  settingsDialogVisible.value = true;
}

// 二维码按钮
function onQRCodeClick() {
  setTimeout(() => {
    const outputElement = document.getElementById('output');
    if (outputElement) {
      // 如果 output 元素为空，需要先初始化二维码
      if (!outputElement.querySelector('canvas')) {
        const url = window.location.href;
        import('../../utils/QRCode').then(({ initQRCode }) => {
          initQRCode(url);
          setTimeout(() => {
            showQRCode();
          }, 300);
        }).catch((error) => {
          console.error('初始化二维码失败:', error);
        });
      } else {
        showQRCode();
      }
    }
  }, 10);
}

onUnmounted(() => {
  closeRunWindow();
});
</script>

<style scoped>
.top-tool-bar {
  position: relative;
  width: 100%;
  height: 22px;
  min-height: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: transparent;
  z-index: 1001;
  pointer-events: auto;
  padding: 0 8px;
  box-sizing: border-box;
}

.tool-section {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
}

.tool-section-left {
  flex: 0 0 auto;
}

.tool-section-center {
  flex: 1;
  justify-content: center;
  gap: 12px;
}

.tool-section-right {
  flex: 0 0 auto;
  justify-content: flex-end;
}

/* 分隔线 */
.divider {
  width: 1px;
  height: 16px;
  background-color: var(--el-border-color, #e4e7ed);
  flex-shrink: 0;
}

/* 工具组 */
.tool-group {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-wrap: nowrap;
}

/* 播放按钮容器 */
.play-button-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 工具按钮 */
.tool-button {
  position: relative;
  min-width: 22px;
  min-height: 22px;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 1002;
  pointer-events: auto;
  flex-shrink: 0;
  box-sizing: border-box;
  border-radius: 2px;
  transition: background-color 0.15s ease;
}

.tool-button:hover {
  background-color: var(--el-fill-color-light, #f5f7fa);
}

.tool-button:active {
  background-color: var(--el-fill-color, #e4e7ed);
}

.tool-button.is-selected {
  background-color: var(--el-color-primary-light-9, #ecf5ff);
}

.play-button {
  z-index: 10001;
  pointer-events: auto;
  position: relative;
}

.center-world-button {
  display: inline-flex !important;
  padding: 0 !important;
  margin: 0 !important;
  vertical-align: top !important;
}

/* 图标样式 */
.tool-button :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
  transition: color 0.15s ease;
}

.tool-button:hover :deep(svg) {
  color: var(--el-color-primary, #409eff);
}

.tool-button.is-selected :deep(svg) {
  color: var(--el-color-primary, #409eff);
}
</style>
