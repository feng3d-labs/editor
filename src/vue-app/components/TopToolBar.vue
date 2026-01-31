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
        :class="['tool-button', 'toggle-button', { 'is-selected': isBaryCenter }]"
        @click="onCenterClick"
        title="Pivot/Center"
      >
        <img v-if="!isBaryCenter" :src="getImageUrl('center_png')" class="button-icon" />
        <img v-else :src="getImageUrl('pivot_png')" class="button-icon" />
      </button>
      <button
        :class="['tool-button', 'toggle-button', { 'is-selected': !isWoldCoordinate }]"
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
        @click="onPlayClick"
        @mousedown="isPlayPressed = true"
        @mouseup="isPlayPressed = false"
        @mouseleave="isPlayPressed = false"
        title="播放"
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { globalEmitter, FS, FSType, serialization } from 'feng3d';
import { EditorData, MRSToolType } from '../../global/EditorData';
import { editorRS } from '../../assets/EditorRS';
import { editorcache } from '../../caches/Editorcache';
import { showQRCode } from '../../utils/QRCode';
import { useEditorStore } from '../stores/editorStore';

const editorStore = useEditorStore();

// 工具类型
const toolType = computed(() => (editorStore as any).toolType || MRSToolType.MOVE);
const isBaryCenter = computed(() => (editorStore as any).isBaryCenter || false);
const isWoldCoordinate = computed(() => (editorStore as any).isWoldCoordinate || false);

// 播放按钮按下状态
const isPlayPressed = ref(false);

// 运行窗口
let runwin: Window | null = null;

// 获取图片 URL（从 Egret 资源系统）
function getImageUrl(resourceName: string): string {
  // 使用 Egret RES 系统获取资源
  // 如果资源已加载，直接返回；否则返回资源路径
  if (typeof (window as any).RES !== 'undefined') {
    const res = (window as any).RES.getRes(resourceName);
    if (res && res.texture && res.texture._bitmapData) {
      // 如果资源是纹理，返回其数据 URL
      return res.texture._bitmapData.source;
    }
  }
  
  // 回退方案：直接使用资源路径
  // 根据资源名称映射到实际路径
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

// 移动工具
function onMoveClick() {
  EditorData.editorData.toolType = MRSToolType.MOVE;
  globalEmitter.emit('editor.toolTypeChanged');
}

// 旋转工具
function onRotateClick() {
  EditorData.editorData.toolType = MRSToolType.ROTATION;
  globalEmitter.emit('editor.toolTypeChanged');
}

// 缩放工具
function onScaleClick() {
  EditorData.editorData.toolType = MRSToolType.SCALE;
  globalEmitter.emit('editor.toolTypeChanged');
}

// Center/Pivot 切换
function onCenterClick() {
  EditorData.editorData.isBaryCenter = !EditorData.editorData.isBaryCenter;
}

// World/Local 切换
function onWorldClick() {
  EditorData.editorData.isWoldCoordinate = !EditorData.editorData.isWoldCoordinate;
}

// 播放按钮
function onPlayClick() {
  globalEmitter.emit('inspector.saveShowData', async () => {
    const obj = serialization.serialize(EditorData.editorData.gameScene.gameObject);
    await editorRS.fs.writeObject('default.scene.json', obj);
    if (editorRS.fs.type === FSType.indexedDB) {
      if (runwin) runwin.close();
      runwin = window.open(`run.html?fstype=${FS.fs.type}&project=${editorcache.projectname}`);
      return;
    }
    const path = editorRS.fs.getAbsolutePath('index.html');
    if (runwin) runwin.close();
    runwin = window.open(path);
  });
}

// 帮助按钮
function onHelpClick() {
  window.open('http://com');
}

// 设置按钮
function onSettingClick() {
  window.open('http://com');
}

// 二维码按钮
function onQRCodeClick() {
  setTimeout(() => {
    showQRCode();
  }, 10);
}

// 监听工具类型变化
function onToolTypeChanged() {
  // 状态已通过 computed 自动更新
}

onMounted(() => {
  globalEmitter.on('editor.toolTypeChanged', onToolTypeChanged);
});

onUnmounted(() => {
  globalEmitter.off('editor.toolTypeChanged', onToolTypeChanged);
  if (runwin) {
    runwin.close();
    runwin = null;
  }
});
</script>

<style scoped>
.top-tool-bar {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: transparent;
}

.tool-group {
  display: flex;
  align-items: center;
  gap: -1px; /* 按钮之间无间隙，与 Egret 版本一致 */
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
}

.tool-group-right {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.tool-button {
  position: relative;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* ToggleButton 选中状态已通过图片切换实现，无需额外样式 */

.button-icon {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: opacity 0.1s;
}

.tool-button:hover {
  opacity: 0.8;
}

.tool-button:active {
  opacity: 0.6;
}

/* 播放按钮使用默认样式 */
</style>

