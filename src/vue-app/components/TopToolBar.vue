<template>
  <div class="top-tool-bar">
    <!-- 左侧：工具组 - 使用 Element Plus ButtonGroup -->
    <div class="tool-section tool-section-left">
      <!-- 工具组：移动、旋转、缩放 -->
      <el-button-group>
        <el-button
          :type="toolType === MRSToolType.MOVE ? 'primary' : 'default'"
          :plain="toolType !== MRSToolType.MOVE"
          size="small"
          @click="onMoveClick"
          :title="t('toolbar.move')"
          class="tool-button"
        >
          <Icon icon="mdi:cursor-move" :size="16" />
        </el-button>
        <el-button
          :type="toolType === MRSToolType.ROTATION ? 'primary' : 'default'"
          :plain="toolType !== MRSToolType.ROTATION"
          size="small"
          @click="onRotateClick"
          :title="t('toolbar.rotate')"
          class="tool-button"
        >
          <Icon icon="mdi:rotate-3d-variant" :size="16" />
        </el-button>
        <el-button
          :type="toolType === MRSToolType.SCALE ? 'primary' : 'default'"
          :plain="toolType !== MRSToolType.SCALE"
          size="small"
          @click="onScaleClick"
          :title="t('toolbar.scale')"
          class="tool-button"
        >
          <Icon icon="mdi:arrow-expand-all" :size="16" />
        </el-button>
      </el-button-group>

      <!-- 分隔线 -->
      <el-divider direction="vertical" class="divider" />

      <!-- 工具组：Pivot/Center、Local/World -->
      <el-button-group>
        <el-button
          :type="isBaryCenter ? 'primary' : 'default'"
          :plain="!isBaryCenter"
          size="small"
          @click="onCenterClick"
          :title="t('toolbar.pivotCenter')"
          class="tool-button"
        >
          <Icon v-if="!isBaryCenter" icon="mdi:crosshairs-gps" :size="16" />
          <Icon v-else icon="mdi:vector-point" :size="16" />
        </el-button>
        <el-button
          :type="!isWoldCoordinate ? 'primary' : 'default'"
          :plain="isWoldCoordinate"
          size="small"
          @click="onWorldClick"
          :title="t('toolbar.localWorld')"
          class="tool-button"
        >
          <Icon v-if="isWoldCoordinate" icon="mdi:earth" :size="16" />
          <Icon v-else icon="mdi:axis-arrow" :size="16" />
        </el-button>
      </el-button-group>
    </div>

    <!-- 中间：播放按钮 - 使用 Element Plus Button -->
    <div class="tool-section tool-section-center">
      <div class="play-button-container">
        <el-button
          type="primary"
          size="small"
          @mousedown.stop="handlePlayMouseDown"
          @mouseup.stop="handlePlayMouseUp"
          @mouseleave="isPlayPressed = false"
          :title="t('toolbar.play')"
          class="play-button"
        >
          <Icon icon="mdi:play" :size="16" style="margin-right: 4px;" />
          <span>{{ t('toolbar.play') }}</span>
        </el-button>
        <el-button
          size="small"
          @click="onPauseClick"
          :title="t('toolbar.pause')"
          class="tool-button"
        >
          <Icon icon="mdi:pause" :size="16" />
        </el-button>
        <el-button
          size="small"
          @click="onStepClick"
          :title="t('toolbar.step')"
          class="tool-button"
        >
          <Icon icon="mdi:step-forward" :size="16" />
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { globalEmitter, FS, FSType, serialization } from 'feng3d';
import { EditorData, MRSToolType } from '../../global/EditorData';
import { editorRS } from '../../assets/EditorRS';
import { editorcache } from '../../caches/Editorcache';
import { useEditorStore } from '../stores/editorStore';
import { closeRunWindow, setRunWindow, getRunWindow } from '../utils/runWindowManager';
import { useI18n } from '../composables/useI18n';
import Icon from './Icon.vue';

const editorStore = useEditorStore();
const { t } = useI18n();

// 工具类型状态
const toolType = computed(() => editorStore.toolType);
const isBaryCenter = computed(() => editorStore.isBaryCenter);
const isWoldCoordinate = computed(() => editorStore.isWoldCoordinate);

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

// 暂停和步进按钮（新增）
function onPauseClick() {
  // TODO: 实现暂停功能
  console.log('Pause clicked');
}

function onStepClick() {
  // TODO: 实现步进功能
  console.log('Step clicked');
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

/* Element Plus Divider 样式覆盖 */
.divider {
  height: 16px;
  margin: 0 8px;
}

/* 播放按钮容器 */
.play-button-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

/* Element Plus Button 样式覆盖 */
.tool-button {
  min-width: 28px;
  min-height: 28px;
  padding: 4px 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tool-button :deep(.el-icon) {
  margin: 0;
}

.play-button {
  z-index: 10001;
  pointer-events: auto;
  position: relative;
}

/* Element Plus ButtonGroup 样式 */
.tool-section :deep(.el-button-group) {
  display: inline-flex;
  gap: 0;
}

.tool-section :deep(.el-button-group .el-button) {
  border-radius: 0;
}

.tool-section :deep(.el-button-group .el-button:first-child) {
  border-top-left-radius: var(--el-border-radius-base);
  border-bottom-left-radius: var(--el-border-radius-base);
}

.tool-section :deep(.el-button-group .el-button:last-child) {
  border-top-right-radius: var(--el-border-radius-base);
  border-bottom-right-radius: var(--el-border-radius-base);
}
</style>
