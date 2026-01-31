<template>
  <div class="top-tool-bar">
    <!-- 左侧工具组：移动、旋转、缩放 -->
    <div class="tool-group tool-group-left">
      <button
        :class="['tool-button', 'toggle-button', { 'is-selected': toolType === MRSToolType.MOVE }]"
        @click="onMoveClick"
        title="移动"
      >
        <img v-if="toolType !== MRSToolType.MOVE" :src="getImageUrl('move_up_png')" class="button-icon" />
        <img v-else :src="getImageUrl('move_down_png')" class="button-icon" />
      </button>
      <button
        :class="['tool-button', 'toggle-button', { 'is-selected': toolType === MRSToolType.ROTATION }]"
        @click="onRotateClick"
        title="旋转"
      >
        <img v-if="toolType !== MRSToolType.ROTATION" :src="getImageUrl('rotate_up_png')" class="button-icon" />
        <img v-else :src="getImageUrl('rotate_down_png')" class="button-icon" />
      </button>
      <button
        :class="['tool-button', 'toggle-button', { 'is-selected': toolType === MRSToolType.SCALE }]"
        @click="onScaleClick"
        title="缩放"
      >
        <img v-if="toolType !== MRSToolType.SCALE" :src="getImageUrl('scale_up_png')" class="button-icon" />
        <img v-else :src="getImageUrl('scale_down_png')" class="button-icon" />
      </button>
    </div>

    <!-- 中间工具组：Pivot/Center、Local/World -->
    <div class="tool-group tool-group-center-left">
      <button
        :class="['tool-button', 'toggle-button', 'center-world-button', { 'is-selected': isBaryCenter }]"
        @click="onCenterClick"
        title="Pivot/Center"
      >
        <img v-if="!isBaryCenter" :src="getImageUrl('center_png')" class="button-icon" />
        <img v-else :src="getImageUrl('pivot_png')" class="button-icon" />
      </button>
      <button
        :class="['tool-button', 'toggle-button', 'center-world-button', { 'is-selected': !isWoldCoordinate }]"
        @click="onWorldClick"
        title="Local/World"
      >
        <img v-if="isWoldCoordinate" :src="getImageUrl('global_png')" class="button-icon" />
        <img v-else :src="getImageUrl('local_png')" class="button-icon" />
      </button>
    </div>

    <!-- 中间播放按钮 -->
    <div class="tool-group tool-group-center">
      <button
        class="tool-button play-button"
        @mousedown.stop="handlePlayMouseDown"
        @mouseup.stop="handlePlayMouseUp"
        @mouseleave="isPlayPressed = false"
        title="播放"
        type="button"
      >
        <img v-if="!isPlayPressed" :src="getImageUrl('play_up_png')" class="button-icon" />
        <img v-else :src="getImageUrl('play_down_png')" class="button-icon" />
      </button>
    </div>

    <!-- 右侧工具组：帮助、二维码、设置 -->
    <div class="tool-group tool-group-right">
      <button
        class="tool-button"
        @click="onHelpClick"
        title="帮助"
      >
        <img :src="getImageUrl('help_png')" class="button-icon" />
      </button>
      <button
        class="tool-button"
        @click="onQRCodeClick"
        title="二维码"
      >
        <img :src="getImageUrl('qrcode_jpg')" class="button-icon" />
      </button>
      <button
        class="tool-button"
        @click="onSettingClick"
        title="设置"
      >
        <img :src="getImageUrl('setting_png')" class="button-icon" />
      </button>
    </div>
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

const editorStore = useEditorStore();

// 工具类型状态
const toolType = computed(() => editorStore.toolType);
const isBaryCenter = computed(() => editorStore.isBaryCenter);
const isWoldCoordinate = computed(() => editorStore.isWoldCoordinate);

// 播放按钮按下状态
const isPlayPressed = ref(false);
let playButtonMouseDownTime = 0;

// 获取图片 URL（从 Egret 资源系统）
function getImageUrl(resourceName: string): string {
  // 使用 Egret RES 系统获取资源
  if (typeof (window as any).RES !== 'undefined') {
    const res = (window as any).RES.getRes(resourceName);
    if (res && res.texture && res.texture._bitmapData) {
      return res.texture._bitmapData.source;
    }
  }
  
  // 回退方案：直接使用资源路径
  const resourceMap: Record<string, string> = {
    'move_up_png': 'resource/assets/Button/move_up.png',
    'move_down_png': 'resource/assets/Button/move_down.png',
    'rotate_up_png': 'resource/assets/Button/rotate_up.png',
    'rotate_down_png': 'resource/assets/Button/rotate_down.png',
    'scale_up_png': 'resource/assets/Button/scale_up.png',
    'scale_down_png': 'resource/assets/Button/scale_down.png',
    'center_png': 'resource/assets/Button/center.png',
    'pivot_png': 'resource/assets/Button/pivot.png',
    'global_png': 'resource/assets/Button/global.png',
    'local_png': 'resource/assets/Button/local.png',
    'play_up_png': 'resource/assets/Button/play_up.png',
    'play_down_png': 'resource/assets/Button/play_down.png',
    'help_png': 'resource/assets/Button/help.png',
    'qrcode_jpg': 'resource/assets/Button/qrcode.jpg',
    'setting_png': 'resource/assets/Button/setting.png',
  };
  
  return resourceMap[resourceName] || `resource/assets/Button/${resourceName.replace('_png', '.png').replace('_jpg', '.jpg')}`;
}

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
        console.error('游戏场景不存在，无法播放');
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
        console.error('无法打开运行窗口，可能被浏览器阻止了弹窗');
      }
    } catch (error) {
      console.error('播放失败:', error);
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
  window.open('https://feng3d.com/');
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
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 0;
  flex-wrap: nowrap;
}

.tool-group-left {
  position: absolute;
  left: 50px;
  top: 50%;
  transform: translateY(-50%);
}

.tool-group-center-left {
  position: absolute;
  left: 220px;
  top: 50%;
  transform: translateY(-50%);
}

.tool-group-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 10000;
  pointer-events: auto;
}

.tool-group-right {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.tool-button {
  position: relative;
  width: 22px;
  height: 22px;
  min-width: 22px;
  min-height: 22px;
  max-width: 22px;
  max-height: 22px;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  display: inline-block;
  overflow: hidden;
  z-index: 1002;
  pointer-events: auto;
  flex-shrink: 0;
  box-sizing: border-box;
  line-height: 0;
  vertical-align: top;
}

.play-button {
  z-index: 10001;
  pointer-events: auto;
  position: relative;
}

.center-world-button {
  width: 22px !important;
  height: 22px !important;
  min-width: 22px !important;
  min-height: 22px !important;
  max-width: 22px !important;
  max-height: 22px !important;
  line-height: 0 !important;
  font-size: 0 !important;
  display: inline-block !important;
}

.center-world-button img {
  display: block !important;
  width: 22px !important;
  height: 22px !important;
  object-fit: cover !important;
  margin: 0 !important;
  padding: 0 !important;
}

.button-icon {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: opacity 0.1s;
  display: block;
}

.center-world-button .button-icon {
  object-fit: cover;
}

.tool-button:hover {
  opacity: 0.8;
}

.tool-button:active {
  opacity: 0.6;
}
</style>
