<template>
  <div
    v-if="camera"
    ref="previewContainerRef"
    class="camera-preview"
    :style="containerStyle"
  >
    <!-- 标题栏 -->
    <div class="camera-preview-header">
      <span class="camera-preview-title">摄像机 预览</span>
    </div>
    
    <!-- 预览区域 -->
    <div ref="previewAreaRef" class="camera-preview-area">
      <!-- Canvas 将通过 ref 动态管理 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick, markRaw, Ref } from 'vue';
import { View, ticker, Camera, globalEmitter, GameObject } from 'feng3d';
import { EditorData } from '../../global/EditorData';
import { useEditorStore } from '../stores/editorStore';

// Props
interface Props {
  parentContainer?: Ref<HTMLElement | undefined>;
}

const props = withDefaults(defineProps<Props>(), {
  parentContainer: undefined,
});

const editorStore = useEditorStore();

// DOM 引用
const previewContainerRef = ref<HTMLElement>();
const previewAreaRef = ref<HTMLElement>();

// 状态
const camera = ref<Camera | null>(null);
const previewView = ref<View | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const containerPosition = ref({ right: 10, bottom: 10 });

// 容器样式（定位在父容器的右下角）
const containerStyle = computed(() => {
  return {
    position: 'absolute',
    right: `${containerPosition.value.right}px`,
    bottom: `${containerPosition.value.bottom}px`,
    width: '400px',
    height: '240px', // 400 * 3 / 5
    zIndex: '10',
    pointerEvents: 'auto',
  };
});

// 初始化预览视图
function initPreviewView() {
  if (!previewAreaRef.value || canvas.value) return;
  
  // 创建 canvas
  const canvasElement = document.createElement('canvas');
  canvas.value = canvasElement;
  
  // 添加到预览区域
  previewAreaRef.value.appendChild(canvasElement);
  
  // 创建 View
  const view = markRaw(new View(canvasElement));
  view.mouse3DManager.mouseInput.enable = false;
  view.stop();
  previewView.value = view;
  
  // 设置 canvas 样式
  updateCanvasStyle();
  
  // 如果已有相机，设置相机
  if (camera.value) {
    view.camera = camera.value;
    ticker.onframe(onFrame);
  }
}

// 更新 canvas 样式
function updateCanvasStyle() {
  if (!canvas.value || !previewAreaRef.value) return;
  
  const rect = previewAreaRef.value.getBoundingClientRect();
  const style = canvas.value.style;
  style.position = 'absolute';
  style.left = '0';
  style.top = '0';
  style.width = `${rect.width}px`;
  style.height = `${rect.height}px`;
  style.cursor = 'hand';
  style.zIndex = '1';
}

// 设置相机
function setCamera(newCamera: Camera | null) {
  // 移除旧相机的渲染
  if (camera.value && previewView.value) {
    ticker.offframe(onFrame);
  }
  
  camera.value = newCamera;
  
  if (previewView.value) {
    previewView.value.camera = newCamera;
    
    if (newCamera) {
      // 显示预览
      if (previewContainerRef.value) {
        previewContainerRef.value.style.display = 'block';
      }
      if (canvas.value) {
        canvas.value.style.display = 'block';
      }
      ticker.onframe(onFrame);
      // 更新位置
      nextTick(() => {
        updateContainerPosition();
      });
    } else {
      // 隐藏预览
      if (previewContainerRef.value) {
        previewContainerRef.value.style.display = 'none';
      }
      if (canvas.value) {
        canvas.value.style.display = 'none';
      }
    }
  }
}

// 渲染帧
function onFrame() {
  if (!previewView.value || !camera.value) return;
  
  // 确保场景正确
  if (previewView.value.scene !== EditorData.editorData.gameScene) {
    previewView.value.scene = EditorData.editorData.gameScene;
  }
  
  previewView.value.render();
}

// 选中对象变化处理
function onSelectedObjectsChanged() {
  const selectedGameObjects = (editorStore as any).selectedGameObjects || [];
  
  if (selectedGameObjects.length > 0) {
    // 查找包含 Camera 组件的对象
    for (let i = 0; i < selectedGameObjects.length; i++) {
      const gameObject = selectedGameObjects[i];
      if (gameObject instanceof GameObject) {
        const cameraComponent = gameObject.getComponent(Camera);
        if (cameraComponent) {
          setCamera(cameraComponent);
          return;
        }
      }
    }
  }
  
  // 没有找到相机，隐藏预览
  setCamera(null);
}

// 更新容器位置（相对于父容器）
function updateContainerPosition() {
  if (!props.parentContainer?.value) return;
  
  // 预览窗口始终定位在父容器的右下角
  // 使用固定的 right 和 bottom 值，CSS 会自动处理定位
  containerPosition.value = { right: 10, bottom: 10 };
}

// 监听窗口大小变化，更新 canvas 尺寸和容器位置
let resizeObserver: ResizeObserver | null = null;
let parentResizeObserver: ResizeObserver | null = null;

onMounted(async () => {
  await nextTick();
  
  // 初始化预览视图
  initPreviewView();
  
  // 监听选中对象变化
  globalEmitter.on('editor.selectedObjectsChanged', onSelectedObjectsChanged);
  
  // 初始检查
  onSelectedObjectsChanged();
  
  // 监听预览区域大小变化
  if (previewAreaRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateCanvasStyle();
    });
    resizeObserver.observe(previewAreaRef.value);
  }
  
  // 监听父容器大小变化，更新预览窗口位置
  if (props.parentContainer?.value) {
    parentResizeObserver = new ResizeObserver(() => {
      updateContainerPosition();
    });
    parentResizeObserver.observe(props.parentContainer.value);
    
    // 初始更新位置
    updateContainerPosition();
  }
});

onUnmounted(() => {
  // 移除事件监听
  globalEmitter.off('editor.selectedObjectsChanged', onSelectedObjectsChanged);
  
  // 停止渲染
  if (camera.value) {
    ticker.offframe(onFrame);
  }
  
  // 清理 ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  
  if (parentResizeObserver) {
    parentResizeObserver.disconnect();
    parentResizeObserver = null;
  }
  
  // 清理 canvas
  if (canvas.value && canvas.value.parentElement) {
    canvas.value.parentElement.removeChild(canvas.value);
  }
  canvas.value = null;
  previewView.value = null;
});
</script>

<style scoped>
.camera-preview {
  display: flex;
  flex-direction: column;
  /* 使用 Element Plus 主题变量 */
  background-color: var(--el-bg-color-overlay, #2d2d2d);
  border: 1px solid var(--el-border-color, #3d3d3d);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  /* 确保预览窗口显示在场景上方 */
  z-index: 10;
}

/* 标题栏 - 参考 exml 中的标题栏样式 */
.camera-preview-header {
  width: 100%;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 使用 Element Plus 主题变量 */
  background-color: rgba(45, 45, 45, 0.5); /* fillAlpha="0.5" */
  border-bottom: 1px solid var(--el-border-color, #3d3d3d);
}

.camera-preview-title {
  font-size: 12px;
  color: #ffffff;
  text-align: center;
  width: 100%;
}

/* 预览区域 - 参考 exml 中的预览区域样式 */
.camera-preview-area {
  flex: 1;
  position: relative;
  /* 使用 Element Plus 主题变量 */
  background-color: #272727;
  border: 3px solid #444444; /* strokeColor="0x444444" strokeWeight="3" */
  overflow: hidden;
}

/* Canvas 样式 */
.camera-preview-area canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>

