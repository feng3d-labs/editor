<template>
  <div class="inspector-view">
    <!-- 头部 -->
    <div class="inspector-header">
      <el-button
        v-if="historySelectedObjects.length > 1"
        size="small"
        text
        @click="onBackButton"
        title="返回上一个对象"
      >
        <Icon icon="mdi:arrow-left" :size="16" style="margin-right: 4px" />
        返回
      </el-button>
      <div class="inspector-title">
        <span v-if="viewData" class="type-name">{{ typeName }}</span>
        <span v-else class="empty-label">未选择对象</span>
      </div>
    </div>

    <!-- 内容区域 -->
    <div ref="contentRef" class="inspector-content">
      <!-- ObjectView 将在这里动态插入 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { globalEmitter, IEvent, Feng3dObject, HideFlags, objectview, FileAsset, ReadRS, GameObject } from 'feng3d';
import { editorRS } from '../../assets/EditorRS';
import { editorAsset } from '../../ui/assets/EditorAsset';
import { AssetNode } from '../../ui/assets/AssetNode';
import { useEditorStore } from '../stores/editorStore';
import { inspectorMultiObject } from '../../ui/inspector/InspectorMultiObject';
import { ObjectViewEvent } from '../../objectview/events/ObjectViewEvent';
import Icon from '../components/Icon.vue';

const editorStore = useEditorStore();

// DOM 引用
const contentRef = ref<HTMLElement>();

// 视图数据
const viewData = ref<any>(null);
const view = ref<any>(null);
const dataChanged = ref(false);

// 历史选中对象列表
const historySelectedObjects = ref<Array<GameObject | AssetNode>[]>([]);
const maxHistorySelectedObject = 10;

// 类型名称
const typeName = computed(() => {
  if (!viewData.value) return '';
  return viewData.value.constructor?.name || '';
});

// 显示数据
function showData(data: any) {
  if (viewData.value === data) return;
  
  if (viewData.value) {
    saveShowData();
  }
  
  viewData.value = data;
  updateView();
}

// 更新视图
async function updateView() {
  // 清理旧视图
  if (view.value && contentRef.value) {
    // 如果视图有 destroy 方法，调用它
    if (view.value.destroy) {
      view.value.destroy();
    } else if ((view.value as any)._egretContainer) {
      // Egret 组件，从容器中移除
      const container = (view.value as any)._egretContainer;
      if (container.parent) {
        container.parent.removeChild(container);
      }
      delete (view.value as any)._egretContainer;
    } else if (view.value.parent) {
      // 如果是 Egret 组件，从父容器移除
      view.value.parent.removeChild(view.value);
    } else if (view.value.dom && contentRef.value.contains(view.value.dom)) {
      // 如果是 DOM 元素，直接移除
      contentRef.value.removeChild(view.value.dom);
    }
    view.value = null;
  }
  
  // 清空内容区域
  if (contentRef.value) {
    contentRef.value.innerHTML = '';
  }
  
  if (!viewData.value) {
    return;
  }
  
  // 处理 AssetNode
  let showData: any = viewData.value;
  
  if (showData instanceof AssetNode) {
    if (showData.isDirectory) return;
    
    if (showData.asset) {
      showData = showData.asset;
    } else if (!showData.isLoaded) {
      const viewDataNode = showData;
      await viewDataNode.load();
      if (viewDataNode === viewData.value) {
        showData = viewDataNode.asset;
      } else {
        return;
      }
    }
  }
  
  // 获取对象视图
  await nextTick();
  if (!contentRef.value) return;
  
  let editable = true;
  if (showData instanceof Feng3dObject) {
    editable = !(showData.hideFlags & HideFlags.NotEditable);
  }
  
  view.value = objectview.getObjectView(showData, { editable });
  
  // 将视图添加到 DOM
  if (view.value) {
    // 检查是否是 Egret 组件（有 stage 属性或 parent 属性，或者是 eui.Component）
    const isEgretComponent = view.value.stage || 
                             (view.value.parent && view.value.parent instanceof (global as any).egret.DisplayObjectContainer) ||
                             (view.value instanceof (global as any).egret.DisplayObject);
    
    if (isEgretComponent) {
      // Egret 组件，需要添加到 Egret 的显示列表
      // 获取 editorui（Egret 的 UI 层）
      const editorui = (global as any).editor?.editorui || (window as any).editor?.editorui;
      
      if (editorui && editorui.popupLayer) {
        // 从旧父容器移除
        if (view.value.parent) {
          view.value.parent.removeChild(view.value);
        }
        
        // 获取或创建 InspectorView 的 group 容器（用于 CameraPreview 等组件）
        // 这个 group 应该模拟原来的 InspectorView.group（在 InspectorView.exml 中定义）
        // CameraPreview 会通过 this.parent 获取到这个 group，并保存为 saveParent
        let inspectorGroup = (window as any).__inspectorGroup;
        if (!inspectorGroup) {
          inspectorGroup = new (global as any).eui.Group();
          // 使用 VerticalLayout，与原 InspectorView.group 保持一致
          const layout = new (global as any).eui.VerticalLayout();
          layout.gap = 0;
          layout.horizontalAlign = 'justify';
          inspectorGroup.layout = layout;
          inspectorGroup.percentWidth = 100;
          inspectorGroup.percentHeight = 100;
          editorui.popupLayer.addChild(inspectorGroup);
          (window as any).__inspectorGroup = inspectorGroup;
        }
        
        // 创建一个 Egret Group 作为容器，用于承载 ObjectView
        // 这个容器会被添加到 inspectorGroup 中，模拟原来的 this.group.addChild(this._view)
        const container = new (global as any).eui.Group();
        container.percentWidth = 100;
        container.percentHeight = 100;
        
        // 将 ObjectView 添加到容器
        container.addChild(view.value);
        
        // 将容器添加到 inspectorGroup（模拟原来的 this.group.addChild(this._view)）
        // 这样当 CameraPreview 被 objectview 创建时，它的 parent 就是 inspectorGroup
        inspectorGroup.addChild(container);
        
        // 设置容器的位置和大小，使其覆盖 InspectorView 的内容区域
        // 使用 nextTick 确保 DOM 已渲染
        nextTick(() => {
          updateEgretContainerPosition(container);
          updateInspectorGroupPosition(inspectorGroup);
        });
        
        // 监听窗口大小变化，更新容器位置
        const resizeObserver = new ResizeObserver(() => {
          updateEgretContainerPosition(container);
          updateInspectorGroupPosition(inspectorGroup);
        });
        if (contentRef.value) {
          resizeObserver.observe(contentRef.value);
        }
        
        // 保存观察器引用，以便后续清理
        (view.value as any)._resizeObserver = resizeObserver;
        
        // 保存容器引用，以便后续清理
        (view.value as any)._egretContainer = container;
      } else {
        console.warn('InspectorView: Egret popupLayer not available');
      }
    } else if (view.value.dom) {
      // Vue 组件返回的 DOM
      contentRef.value.appendChild(view.value.dom);
    } else if (view.value instanceof HTMLElement) {
      // 直接是 DOM 元素
      contentRef.value.appendChild(view.value);
    } else {
      // 未知类型，创建占位
      const placeholder = document.createElement('div');
      placeholder.textContent = `ObjectView (type: ${typeof view.value})`;
      placeholder.style.padding = '20px';
      placeholder.style.color = 'var(--el-text-color-secondary, #666666)';
      contentRef.value.appendChild(placeholder);
    }
    
    // 监听值变化事件
    if (view.value.addEventListener) {
      view.value.addEventListener(ObjectViewEvent.VALUE_CHANGE, onValueChanged);
    } else if (view.value.on) {
      // 使用 EventEmitter 方式
      view.value.on(ObjectViewEvent.VALUE_CHANGE, onValueChanged);
    }
  }
  
  // 滚动到顶部
  if (contentRef.value) {
    contentRef.value.scrollTop = 0;
  }
}

// 值变化处理
function onValueChanged(_e: ObjectViewEvent) {
  dataChanged.value = true;
  
  if (viewData.value instanceof FileAsset) {
    if (viewData.value.assetId) {
      const assetNode = editorAsset.getAssetByID(viewData.value.assetId);
      assetNode && assetNode.updateImage();
    }
  } else if (viewData.value instanceof AssetNode) {
    viewData.value.updateImage();
  }
}

// 保存显示数据
async function saveShowData() {
  if (!dataChanged.value || !viewData.value) return;
  
  if (viewData.value.assetId) {
    const feng3dAsset = ReadRS.rs.getAssetById(viewData.value.assetId);
    if (feng3dAsset) {
      await editorRS.writeAsset(feng3dAsset);
    }
  } else if (viewData.value instanceof AssetNode) {
    editorAsset.saveAsset(viewData.value);
  }
  
  dataChanged.value = false;
}

// 选中对象变化处理
function onSelectedObjectsChanged() {
  // 保存历史
  const currentSelected = (editorStore as any).selectedObjects;
  historySelectedObjects.value.push([...currentSelected]);
  if (historySelectedObjects.value.length > maxHistorySelectedObject) {
    historySelectedObjects.value.shift();
  }
  
  // 转换对象（处理多对象选择）
  const data = inspectorMultiObject.convertInspectorObject(currentSelected);
  showData(data);
}

// 返回上一个对象
function preSelectedObjects() {
  if (historySelectedObjects.value.length > 1) {
    historySelectedObjects.value.pop();
    const previousObjects = historySelectedObjects.value.pop();
    if (previousObjects) {
      // 使用 setSelectedObjects 方法设置选中对象
      (editorStore as any).setSelectedObjects(previousObjects);
    }
  }
}

// 返回按钮点击
function onBackButton() {
  preSelectedObjects();
}

// 更新 Egret 容器的位置和大小
function updateEgretContainerPosition(container: any) {
  if (!contentRef.value || !container) return;
  
  const rect = contentRef.value.getBoundingClientRect();
  const editorui = (global as any).editor?.editorui || (window as any).editor?.editorui;
  
  if (editorui && editorui.stage) {
    // 将屏幕坐标转换为 Egret 舞台坐标
    container.x = rect.left;
    container.y = rect.top;
    container.width = rect.width;
    container.height = rect.height;
  }
}

// 更新 InspectorView 的 group 位置和大小（用于 CameraPreview 等组件）
function updateInspectorGroupPosition(inspectorGroup: any) {
  if (!contentRef.value || !inspectorGroup) return;
  
  const rect = contentRef.value.getBoundingClientRect();
  const editorui = (global as any).editor?.editorui || (window as any).editor?.editorui;
  
  if (editorui && editorui.stage) {
    // 将屏幕坐标转换为 Egret 舞台坐标
    inspectorGroup.x = rect.left;
    inspectorGroup.y = rect.top;
    inspectorGroup.width = rect.width;
    inspectorGroup.height = rect.height;
  }
}

// 监听更新事件
function onUpdateView() {
  updateView();
}

// 监听保存事件
async function onSaveShowData(event: IEvent<() => void | Promise<void>>) {
  console.log('InspectorView: 收到 saveShowData 事件', event);
  
  // 先保存数据（与 Egret 版本一致）
  await saveShowData();
  console.log('InspectorView: 数据保存完成');
  
  // 保存完成后执行回调（播放功能）
  if (event.data) {
    try {
      console.log('InspectorView: 执行回调');
      const result = event.data();
      // 如果回调返回 Promise，等待它完成
      if (result instanceof Promise) {
        await result;
        console.log('InspectorView: 回调执行完成');
      }
    } catch (error) {
      console.error('执行回调失败:', error);
    }
  } else {
    console.warn('InspectorView: 事件没有回调数据');
  }
}

onMounted(() => {
  globalEmitter.on('editor.selectedObjectsChanged', onSelectedObjectsChanged);
  globalEmitter.on('inspector.update', onUpdateView);
  globalEmitter.on('inspector.saveShowData', onSaveShowData);
  
  // 创建 InspectorView 的 group 容器（用于 CameraPreview 等组件）
  // 这个 group 应该模拟原来的 InspectorView.group
  const editorui = (global as any).editor?.editorui || (window as any).editor?.editorui;
  if (editorui && editorui.popupLayer) {
    let inspectorGroup = (window as any).__inspectorGroup;
    if (!inspectorGroup) {
      inspectorGroup = new (global as any).eui.Group();
      inspectorGroup.percentWidth = 100;
      inspectorGroup.percentHeight = 100;
      editorui.popupLayer.addChild(inspectorGroup);
      (window as any).__inspectorGroup = inspectorGroup;
      
      // 监听窗口大小变化，更新 group 位置
      const resizeObserver = new ResizeObserver(() => {
        if (contentRef.value && inspectorGroup) {
          updateInspectorGroupPosition(inspectorGroup);
        }
      });
      if (contentRef.value) {
        resizeObserver.observe(contentRef.value);
      }
      (window as any).__inspectorGroupResizeObserver = resizeObserver;
      
      // 初始更新位置
      nextTick(() => {
        if (contentRef.value && inspectorGroup) {
          updateInspectorGroupPosition(inspectorGroup);
        }
      });
    }
  }
  
  // 初始化视图
  updateView();
});

onUnmounted(() => {
  globalEmitter.off('editor.selectedObjectsChanged', onSelectedObjectsChanged);
  globalEmitter.off('inspector.update', onUpdateView);
  globalEmitter.off('inspector.saveShowData', onSaveShowData);
  
  // 清理 InspectorView group 的 ResizeObserver
  if ((window as any).__inspectorGroupResizeObserver) {
    (window as any).__inspectorGroupResizeObserver.disconnect();
    delete (window as any).__inspectorGroupResizeObserver;
  }
  
  // 清理视图
  if (view.value) {
    // 移除事件监听
    if (view.value.removeEventListener) {
      view.value.removeEventListener(ObjectViewEvent.VALUE_CHANGE, onValueChanged);
    } else if (view.value.off) {
      view.value.off(ObjectViewEvent.VALUE_CHANGE, onValueChanged);
    }
    
    // 清理 Egret 容器
    if ((view.value as any)._egretContainer) {
      const container = (view.value as any)._egretContainer;
      if (container.parent) {
        container.parent.removeChild(container);
      }
      delete (view.value as any)._egretContainer;
    }
    
    // 清理 ResizeObserver
    if ((view.value as any)._resizeObserver) {
      (view.value as any)._resizeObserver.disconnect();
      delete (view.value as any)._resizeObserver;
    }
    
    // 从父容器移除（如果不是通过容器添加的）
    if (view.value.parent && !(view.value as any)._egretContainer) {
      view.value.parent.removeChild(view.value);
    }
    
    // 调用 destroy（如果有）
    if (view.value.destroy) {
      view.value.destroy();
    }
  }
  
  // 保存数据
  saveShowData();
});
</script>

<style scoped>
.inspector-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  /* 使用 Element Plus 主题变量 */
  background-color: var(--el-bg-color, #1e1e1e);
  color: var(--el-text-color-primary, #cccccc);
}

.inspector-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color, #3d3d3d);
  /* 使用 Element Plus 主题变量 */
  background-color: var(--el-bg-color-overlay, #2d2d2d);
  gap: 8px;
}

.inspector-title {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.type-name {
  /* 使用 Element Plus 主题变量 */
  color: var(--el-text-color-primary, #cccccc);
}

.empty-label {
  /* 使用 Element Plus 主题变量 */
  color: var(--el-text-color-secondary, #666666);
  font-style: italic;
}

.inspector-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

/* 确保 ObjectView 内容正确显示 */
.inspector-content :deep(*) {
  /* 使用 Element Plus 主题变量 */
  color: var(--el-text-color-primary, #cccccc);
}
</style>

