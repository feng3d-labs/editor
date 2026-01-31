<template>
  <div ref="containerRef" class="scene-view">
    <!-- Canvas 将通过 ref 动态管理 -->
    <!-- 背景区域用于鼠标事件检测 -->
    <div ref="backRectRef" class="scene-back-rect"></div>
    <!-- 工具视图容器 -->
    <div ref="toolViewContainerRef" class="scene-tool-view-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, markRaw } from 'vue';
import { Vector2, Camera, GameObject, Vector3, Matrix4x4, Stats, serialization, FPSController, Scene, RunEnvironment, loader, shortcut, globalEmitter, windowEventProxy, raycaster, ticker, PerspectiveLens, IEvent } from 'feng3d';
import * as TWEEN from '@tweenjs/tween.js';
import { EditorComponent } from '../../feng3d/EditorComponent';
import { EditorView } from '../../feng3d/EditorView';
import { GroundGrid } from '../../feng3d/GroundGrid';
import { hierarchy } from '../../feng3d/hierarchy/Hierarchy';
import { MRSTool } from '../../feng3d/mrsTool/MRSTool';
import { SceneRotateTool } from '../../feng3d/scene/SceneRotateTool';
import { useEditorStore } from '../stores/editorStore';
import { sceneControlConfig } from '../../shortcut/Editorshortcut';
import { AreaSelectRect } from '../../ui/components/AreaSelectRect';
import { drag } from '../../ui/drag/Drag';
import { editorui } from '../../global/editorui';

const editorStore = useEditorStore();

// DOM 引用
const containerRef = ref<HTMLElement>();
const backRectRef = ref<HTMLElement>();
const toolViewContainerRef = ref<HTMLElement>();

// 3D 渲染相关
const canvas = ref<HTMLCanvasElement | null>(null);
const view = ref<any>(null); // EditorView
const editorCamera = ref<Camera | null>(null);
const areaSelectRect = ref<AreaSelectRect | null>(null);
const areaSelectStartPosition = ref<Vector2 | null>(null);

// Egret 容器用于拖放注册（drag.register 需要 egret.DisplayObject）
let dragContainer: egret.DisplayObject | null = null;

// 状态
const selectedObjectsHistory = ref<GameObject[]>([]);
const rotateSceneCenter = ref<Vector3 | null>(null);
const rotateSceneCameraGlobalMatrix = ref<Matrix4x4 | null>(null);
const rotateSceneMousePoint = ref<Vector2 | null>(null);
const preMousePoint = ref<Vector2 | null>(null);
const dragSceneMousePoint = ref<Vector2 | null>(null);
const dragSceneCameraGlobalMatrix = ref<Matrix4x4 | null>(null);

// 鼠标是否在视图中
function getMouseInView(): boolean {
  if (!containerRef.value) return false;
  const rect = containerRef.value.getBoundingClientRect();
  const x = windowEventProxy.clientX;
  const y = windowEventProxy.clientY;
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

// 获取全局边界
function getGlobalBounds() {
  if (!containerRef.value) return { x: 0, y: 0, width: 0, height: 0 };
  const rect = containerRef.value.getBoundingClientRect();
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
    contains: (x: number, y: number) => {
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    },
    clampPoint: (point: Vector2) => {
      return new Vector2(
        Math.max(rect.left, Math.min(rect.right, point.x)),
        Math.max(rect.top, Math.min(rect.bottom, point.y))
      );
    }
  };
}

// 初始化 3D 场景
function initScene() {
  if (canvas.value && !view.value) {
    // 确保 canvas 在 DOM 中并且有尺寸
    if (!canvas.value.parentElement) {
      console.error('SceneView: canvas is not in DOM');
      return false; // 返回 false 表示初始化失败
    }
    
    const rect = canvas.value.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      // 尺寸无效，返回 false，等待 ResizeObserver 触发
      return false;
    }
    
    console.log('SceneView: initializing scene', { canvasSize: { width: rect.width, height: rect.height } });
    
    // 初始化 Stats
    Stats.init(document.getElementById('stats'));
    
    // 创建 EditorView
    view.value = markRaw(new EditorView(canvas.value) as any);
    
    // 启动渲染循环（View 类需要手动启动）
    if (view.value && typeof (view.value as any).start === 'function') {
      (view.value as any).start();
      console.log('SceneView: rendering started');
    } else {
      console.warn('SceneView: view.start() is not available');
    }
    
    // 创建编辑器相机（使用 markRaw 防止 Vue 响应式包装）
    const camera = markRaw(serialization.setValue(new GameObject(), { name: 'editorCamera' }).addComponent(Camera));
    camera.lens.far = 5000;
    camera.transform.x = 5;
    camera.transform.y = 3;
    camera.transform.z = 5;
    camera.transform.lookAt(new Vector3());
    camera.gameObject.addComponent(FPSController).auto = false;
    editorCamera.value = camera;
    // 确保传递给 EditorView 的 camera 也是原始对象
    view.value.camera = camera;
    
    // 创建编辑器场景（使用 markRaw 防止 Vue 响应式包装）
    const editorScene = serialization.setValue(new GameObject(), { name: 'editorScene' }).addComponent(Scene);
    editorScene.runEnvironment = RunEnvironment.all;
    view.value.editorScene = markRaw(editorScene);
    
    // 添加场景旋转工具
    const sceneRotateTool = editorScene.gameObject.addComponent(SceneRotateTool);
    sceneRotateTool.view = view.value;
    
    // 初始化模块
    const groundGrid = editorScene.gameObject.addComponent(GroundGrid);
    groundGrid.editorCamera = camera; // 使用原始对象，不是 ref
    const mrsTool = editorScene.gameObject.addComponent(MRSTool);
    mrsTool.editorCamera = camera; // 使用原始对象，不是 ref
    view.value.editorComponent = editorScene.gameObject.addComponent(EditorComponent);
    
    // 加载 Trident 对象
    const editorData = (editorStore as any);
    if (editorData.getEditorAssetPath) {
      loader.loadText(editorData.getEditorAssetPath('gameobjects/Trident.gameobject.json')).then((content) => {
        const trident: GameObject = serialization.deserialize(JSON.parse(content));
        editorScene.gameObject.addChild(trident);
      });
    }
    
    // 初始化成功，返回 true
    return true;
  }
  return false;
}

// 尝试初始化场景（如果尺寸有效）
function tryInitScene() {
  if (canvas.value && !view.value) {
    const success = initScene();
    if (success) {
      // 初始化成功后，更新 canvas 大小
      updateCanvasSize();
    }
    return success;
  }
  return false;
}

// 更新 Canvas 位置和大小
function updateCanvasSize() {
  if (!canvas.value || !containerRef.value) return;
  
  const rect = containerRef.value.getBoundingClientRect();
  
  // 确保 canvas 有有效的尺寸
  if (rect.width <= 0 || rect.height <= 0) {
    console.warn('SceneView: container has invalid size', rect);
    return;
  }
  
  // 设置 canvas 大小（相对于容器）
  if (view.value && typeof (view.value as any).setSize === 'function') {
    (view.value as any).setSize(rect.width, rect.height);
  } else {
    // 如果 setSize 不可用，直接设置 canvas 尺寸
    canvas.value.width = rect.width;
    canvas.value.height = rect.height;
  }
  
  // 更新 Stats 位置（相对于视口）
  if (Stats.instance && Stats.instance.dom) {
    Stats.instance.dom.style.left = `${rect.left}px`;
    Stats.instance.dom.style.top = `${rect.top}px`;
  }
  
  console.log('SceneView: canvas size updated', { width: rect.width, height: rect.height });
}

// 鼠标进入视图
function onMouseOver() {
  shortcut.activityState('mouseInView3D');
}

// 鼠标离开视图
function onMouseOut() {
  shortcut.deactivityState('mouseInView3D');
}

// 选择游戏对象
function onSelectGameObject() {
  if (!getMouseInView() || !view.value) return;
  
  let gameObjects = raycaster.pickAll(view.value.mouseRay3D, view.value.editorScene.mouseCheckObjects)
    .sort((a, b) => a.rayEntryDistance - b.rayEntryDistance)
    .map((v) => v.gameObject);
  
  if (gameObjects.length > 0) {
    return;
  }
  
  const gameScene = (editorStore as any).gameScene;
  if (!gameScene) return;
  
  gameObjects = raycaster.pickAll(view.value.mouseRay3D, gameScene.mouseCheckObjects)
    .sort((a, b) => a.rayEntryDistance - b.rayEntryDistance)
    .map((v) => v.gameObject);
  
  if (gameObjects.length === 0) {
    (editorStore as any).clearSelectedObjects();
    return;
  }
  
  // 过滤游戏对象
  gameObjects = gameObjects.reduce((pv: GameObject[], gameObject) => {
    let node = hierarchy.getNode(gameObject);
    while (!node && gameObject.parent) {
      gameObject = gameObject.parent;
      node = hierarchy.getNode(gameObject);
    }
    if (gameObject !== gameObject.scene.gameObject) {
      pv.push(gameObject);
    }
    return pv;
  }, []);
  
  if (gameObjects.length > 0) {
    const history = selectedObjectsHistory.value;
    let gameObject = gameObjects.reduce((pv, cv) => {
      if (pv) return pv;
      if (history.indexOf(cv) === -1) pv = cv;
      return pv;
    }, null as GameObject | null);
    
    if (!gameObject) {
      history.length = 0;
      gameObject = gameObjects[0];
    }
    
    (editorStore as any).selectObject(gameObject);
    history.push(gameObject);
  } else {
    (editorStore as any).clearSelectedObjects();
  }
}

// 区域选择开始
function onAreaSelectStart() {
  if (!getMouseInView()) return;
  areaSelectStartPosition.value = new Vector2(windowEventProxy.clientX, windowEventProxy.clientY);
}

// 区域选择
function onAreaSelect() {
  if (!areaSelectStartPosition.value || !view.value) return;
  
  let areaSelectEndPosition = new Vector2(windowEventProxy.clientX, windowEventProxy.clientY);
  const rectangle = getGlobalBounds();
  areaSelectEndPosition = rectangle.clampPoint(areaSelectEndPosition);
  
  if (!areaSelectRect.value) {
    areaSelectRect.value = new AreaSelectRect();
  }
  areaSelectRect.value.show(areaSelectStartPosition.value, areaSelectEndPosition);
  
  const gs = view.value.getObjectsInGlobalArea(areaSelectStartPosition.value, areaSelectEndPosition);
  const gs0 = gs.filter((g) => !!hierarchy.getNode(g)) as any as GameObject[];
  (editorStore as any).selectMultiObject(gs0);
}

// 区域选择结束
function onAreaSelectEnd() {
  areaSelectStartPosition.value = null;
  if (areaSelectRect.value) {
    areaSelectRect.value.hide();
  }
}

// 鼠标旋转场景开始
function onMouseRotateSceneStart() {
  if (!getMouseInView() || !editorCamera.value) return;
  
  rotateSceneMousePoint.value = new Vector2(windowEventProxy.clientX, windowEventProxy.clientY);
  rotateSceneCameraGlobalMatrix.value = editorCamera.value.transform.localToWorldMatrix.clone();
  rotateSceneCenter.value = null;
  
  const transformBox = (editorStore as any).transformBox;
  if (transformBox) {
    rotateSceneCenter.value = transformBox.getCenter();
  } else {
    rotateSceneCenter.value = rotateSceneCameraGlobalMatrix.value.getAxisZ();
    rotateSceneCenter.value.scaleNumber(sceneControlConfig.lookDistance);
    rotateSceneCenter.value = rotateSceneCenter.value.addTo(rotateSceneCameraGlobalMatrix.value.getPosition());
  }
}

// 鼠标旋转场景
function onMouseRotateScene() {
  if (!rotateSceneMousePoint.value || !rotateSceneCameraGlobalMatrix.value || !rotateSceneCenter.value || !editorCamera.value || !view.value) return;
  
  const globalMatrix = rotateSceneCameraGlobalMatrix.value.clone();
  const mousePoint = new Vector2(windowEventProxy.clientX, windowEventProxy.clientY);
  const view3DRect = view.value.viewRect;
  const rotateX = (mousePoint.y - rotateSceneMousePoint.value.y) / view3DRect.height * 180;
  const rotateY = (mousePoint.x - rotateSceneMousePoint.value.x) / view3DRect.width * 180;
  globalMatrix.appendRotation(Vector3.Y_AXIS, rotateY, rotateSceneCenter.value);
  const rotateAxisX = globalMatrix.getAxisX();
  globalMatrix.appendRotation(rotateAxisX, rotateX, rotateSceneCenter.value);
  editorCamera.value.transform.localToWorldMatrix = globalMatrix;
}

// 鼠标旋转场景结束
function onMouseRotateSceneEnd() {
  rotateSceneMousePoint.value = null;
}

// 场景相机前后移动开始
function onSceneCameraForwardBackMouseMoveStart() {
  if (!getMouseInView()) return;
  preMousePoint.value = new Vector2(windowEventProxy.clientX, windowEventProxy.clientY);
}

// 场景相机前后移动
function onSceneCameraForwardBackMouseMove() {
  if (!preMousePoint.value || !editorCamera.value) return;
  
  const currentMousePoint = new Vector2(windowEventProxy.clientX, windowEventProxy.clientY);
  const moveDistance = (currentMousePoint.x + currentMousePoint.y - preMousePoint.value.x - preMousePoint.value.y) * sceneControlConfig.sceneCameraForwardBackwardStep;
  sceneControlConfig.lookDistance -= moveDistance;
  
  const forward = editorCamera.value.transform.localToWorldMatrix.getAxisZ();
  const camerascenePosition = editorCamera.value.transform.worldPosition;
  const newCamerascenePosition = new Vector3(
    forward.x * moveDistance + camerascenePosition.x,
    forward.y * moveDistance + camerascenePosition.y,
    forward.z * moveDistance + camerascenePosition.z);
  const newCameraPosition = editorCamera.value.transform.worldToLocalPoint(newCamerascenePosition);
  editorCamera.value.transform.position = newCameraPosition;
  
  preMousePoint.value = currentMousePoint;
}

// 场景相机前后移动结束
function onSceneCameraForwardBackMouseMoveEnd() {
  preMousePoint.value = null;
}

// 拖拽场景开始
function onDragSceneStart() {
  if (!getMouseInView() || !editorCamera.value) return;
  
  dragSceneMousePoint.value = new Vector2(windowEventProxy.clientX, windowEventProxy.clientY);
  dragSceneCameraGlobalMatrix.value = editorCamera.value.transform.localToWorldMatrix.clone();
}

// 拖拽场景
function onDragScene() {
  if (!dragSceneMousePoint.value || !dragSceneCameraGlobalMatrix.value || !editorCamera.value || !view.value) return;
  
  const mousePoint = new Vector2(windowEventProxy.clientX, windowEventProxy.clientY);
  const addPoint = mousePoint.subTo(dragSceneMousePoint.value);
  const scale = view.value.getScaleByDepth(sceneControlConfig.lookDistance);
  const up = dragSceneCameraGlobalMatrix.value.getAxisY();
  const right = dragSceneCameraGlobalMatrix.value.getAxisX();
  up.normalize(addPoint.y * scale);
  right.normalize(-addPoint.x * scale);
  const globalMatrix = dragSceneCameraGlobalMatrix.value.clone();
  globalMatrix.appendTranslation(up.x + right.x, up.y + right.y, up.z + right.z);
  editorCamera.value.transform.localToWorldMatrix = globalMatrix;
}

// 拖拽场景结束
function onDragSceneEnd() {
  dragSceneMousePoint.value = null;
  dragSceneCameraGlobalMatrix.value = null;
}

// FPS 视图开始
function onFpsViewStart() {
  if (!getMouseInView() || !editorCamera.value) return;
  
  const fpsController: FPSController = editorCamera.value.getComponent(FPSController);
  fpsController.onMousedown();
  ticker.onframe(updateFpsView);
}

// FPS 视图停止
function onFpsViewStop() {
  if (!editorCamera.value) return;
  
  const fpsController = editorCamera.value.getComponent(FPSController);
  fpsController.onMouseup();
  ticker.offframe(updateFpsView);
}

// 更新 FPS 视图
function updateFpsView() {
  if (!editorCamera.value) return;
  
  const fpsController = editorCamera.value.getComponent(FPSController);
  fpsController.update();
}

// 看向选中的游戏对象
function onLookToSelectedGameObject() {
  if (!getMouseInView() || !editorCamera.value) return;
  
  const transformBox = (editorStore as any).transformBox;
  if (transformBox) {
    const scenePosition = transformBox.getCenter();
    let size = transformBox.getSize().length;
    size = Math.max(size, 1);
    let lookDistance = size;
    const lens = editorCamera.value.lens;
    if (lens instanceof PerspectiveLens) {
      lookDistance = 0.6 * size / Math.tan(lens.fov * Math.PI / 360);
    }
    
    sceneControlConfig.lookDistance = lookDistance;
    const lookPos = editorCamera.value.transform.localToWorldMatrix.getAxisZ();
    lookPos.scaleNumber(-lookDistance);
    lookPos.add(scenePosition);
    let localLookPos = lookPos.clone();
    if (editorCamera.value.transform.parent) {
      localLookPos = editorCamera.value.transform.parent.worldToLocalMatrix.transformPoint3(lookPos);
    }
    
    const tween = new TWEEN.Tween(editorCamera.value.transform)
      .to({ x: localLookPos.x, y: localLookPos.y, z: localLookPos.z }, 300)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .start();
  }
}

// 鼠标滚轮移动场景相机
function onMouseWheelMoveSceneCamera() {
  if (!getMouseInView() || !editorCamera.value) return;
  
  const distance = -windowEventProxy.deltaY * sceneControlConfig.mouseWheelMoveStep * sceneControlConfig.lookDistance / 10;
  editorCamera.value.transform.localToWorldMatrix = editorCamera.value.transform.localToWorldMatrix.moveForward(distance);
  sceneControlConfig.lookDistance -= distance;
}

// 添加场景工具视图
function onAddSceneToolView(event: IEvent<any>) {
  // 获取原始对象（避免 Vue Proxy 干扰）
  const component = getRawObject(event.data);
  if (!component || !toolViewContainerRef.value) return;
  
  // 如果 component 是 Egret 组件，需要添加到 Egret 舞台
  // 由于 Vue 和 Egret 的显示系统不同，我们需要将 Egret 组件添加到 editorui.stage
  // 但需要确保它显示在 SceneView 容器上方
  if (component instanceof (globalThis as any).eui.Component || component instanceof (globalThis as any).egret.DisplayObject) {
    // 将组件添加到 editorui 的 messageLayer（最上层）
    // 或者创建一个专门的容器层
    if (editorui.stage && editorui.messageLayer) {
      // 设置组件位置和大小，使其覆盖 SceneView 区域
      const rect = toolViewContainerRef.value.getBoundingClientRect();
      component.x = rect.left;
      component.y = rect.top;
      component.width = rect.width;
      component.height = rect.height;
      
      // 添加到 messageLayer（最上层，不会被其他内容遮挡）
      editorui.messageLayer.addChild(component);
    } else {
      console.warn('SceneView: editorui.stage or messageLayer not available');
    }
  }
}

// 获取原始对象的辅助函数（避免 Vue Proxy 干扰 feng3d 事件系统）
function getRawObject<T>(obj: T): T {
  if (!obj) return obj;
  const proxy = obj as any;
  if (proxy && typeof proxy === 'object' && '__v_raw' in proxy) {
    return proxy.__v_raw;
  }
  if (typeof (window as any).toRaw === 'function') {
    try {
      return (window as any).toRaw(obj);
    } catch (e) {
      // 忽略错误
    }
  }
  return obj;
}

onMounted(async () => {
  // 等待容器准备好
  await nextTick();
  
  if (!containerRef.value) {
    console.error('SceneView: containerRef is not available');
    return;
  }
  
  // 创建 canvas
  canvas.value = document.createElement('canvas');
  canvas.value.id = 'scene-canvas';
  canvas.value.style.position = 'absolute';
  canvas.value.style.left = '0px';
  canvas.value.style.top = '0px';
  canvas.value.style.width = '100%';
  canvas.value.style.height = '100%';
  canvas.value.style.pointerEvents = 'auto';
  canvas.value.style.zIndex = '0';
  // 先添加到 DOM，确保 View 可以正确初始化
  containerRef.value.appendChild(canvas.value);
  
  // 等待 DOM 更新
  await nextTick();
  
  // 使用 ResizeObserver 监听容器尺寸变化
  const resizeObserver = new ResizeObserver((entries) => {
    if (!entries.length) return;
    
    const entry = entries[0];
    const { width, height } = entry.contentRect;
    
    // 如果容器有有效尺寸，尝试初始化场景
    if (width > 0 && height > 0) {
      if (!view.value) {
        // 场景未初始化，尝试初始化
        const success = tryInitScene();
        if (success) {
          console.log('SceneView: scene initialized after resize', { width, height });
        }
      } else {
        // 场景已初始化，更新 canvas 大小
        updateCanvasSize();
      }
    }
  });
  
  // 开始观察容器尺寸
  if (containerRef.value) {
    resizeObserver.observe(containerRef.value);
    // 保存 observer 引用以便清理
    (containerRef.value as any)._resizeObserver = resizeObserver;
    
    // 立即检查一次尺寸（可能容器已经有尺寸了）
    const rect = containerRef.value.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      tryInitScene();
    }
  }
  
  // 鼠标事件 - 直接绑定到 canvas 上，因为 canvas 需要接收所有鼠标事件
  if (canvas.value) {
    canvas.value.addEventListener('mouseenter', onMouseOver);
    canvas.value.addEventListener('mouseleave', onMouseOut);
  }
  
  // 快捷键
  shortcut.on('selectGameObject', onSelectGameObject);
  shortcut.on('areaSelectStart', onAreaSelectStart);
  shortcut.on('areaSelect', onAreaSelect);
  shortcut.on('areaSelectEnd', onAreaSelectEnd);
  shortcut.on('mouseRotateSceneStart', onMouseRotateSceneStart);
  shortcut.on('mouseRotateScene', onMouseRotateScene);
  shortcut.on('mouseRotateSceneEnd', onMouseRotateSceneEnd);
  shortcut.on('sceneCameraForwardBackMouseMoveStart', onSceneCameraForwardBackMouseMoveStart);
  shortcut.on('sceneCameraForwardBackMouseMove', onSceneCameraForwardBackMouseMove);
  shortcut.on('sceneCameraForwardBackMouseMoveEnd', onSceneCameraForwardBackMouseMoveEnd);
  shortcut.on('lookToSelectedGameObject', onLookToSelectedGameObject);
  shortcut.on('dragSceneStart', onDragSceneStart);
  shortcut.on('dragScene', onDragScene);
  shortcut.on('dragSceneEnd', onDragSceneEnd);
  shortcut.on('fpsViewStart', onFpsViewStart);
  shortcut.on('fpsViewStop', onFpsViewStop);
  shortcut.on('mouseWheelMoveSceneCamera', onMouseWheelMoveSceneCamera);
  
  // 全局事件
  globalEmitter.on('editor.addSceneToolView', onAddSceneToolView);
  
  // 拖放功能
  // drag.register 需要 egret.DisplayObject，但 containerRef.value 是 DOM 元素
  // 创建一个隐藏的 Egret 容器用于拖放注册
  if (editorui.stage) {
    dragContainer = new (globalThis as any).eui.Group();
    dragContainer.width = 0;
    dragContainer.height = 0;
    dragContainer.visible = false;
    // 将容器添加到舞台（但不显示）
    editorui.stage.addChild(dragContainer);
    
    // 注册拖放功能
    drag.register(dragContainer, null, ['file_gameobject', 'file_script'], (dragdata) => {
      dragdata.getDragData('file_gameobject').forEach((v) => {
        hierarchy.addGameoObjectFromAsset(v, hierarchy.rootnode.gameobject);
      });
      dragdata.getDragData('file_script').forEach((v) => {
        let gameobject = view.value?.mouse3DManager.selectedGameObject;
        if (!gameobject || !gameobject.scene) {
          gameobject = hierarchy.rootnode.gameobject;
        }
        gameobject.addScript(v.scriptName);
      });
    });
  }
  
  // 保存观察器引用
  (containerRef.value as any)._resizeObserver = resizeObserver;
});

onUnmounted(() => {
  // 移除鼠标事件
  if (canvas.value) {
    canvas.value.removeEventListener('mouseenter', onMouseOver);
    canvas.value.removeEventListener('mouseleave', onMouseOut);
  }
  
  // 移除快捷键
  shortcut.off('selectGameObject', onSelectGameObject);
  shortcut.off('areaSelectStart', onAreaSelectStart);
  shortcut.off('areaSelect', onAreaSelect);
  shortcut.off('areaSelectEnd', onAreaSelectEnd);
  shortcut.off('mouseRotateSceneStart', onMouseRotateSceneStart);
  shortcut.off('mouseRotateScene', onMouseRotateScene);
  shortcut.off('mouseRotateSceneEnd', onMouseRotateSceneEnd);
  shortcut.off('sceneCameraForwardBackMouseMoveStart', onSceneCameraForwardBackMouseMoveStart);
  shortcut.off('sceneCameraForwardBackMouseMove', onSceneCameraForwardBackMouseMove);
  shortcut.off('sceneCameraForwardBackMouseMoveEnd', onSceneCameraForwardBackMouseMoveEnd);
  shortcut.off('lookToSelectedGameObject', onLookToSelectedGameObject);
  shortcut.off('dragSceneStart', onDragSceneStart);
  shortcut.off('dragScene', onDragScene);
  shortcut.off('dragSceneEnd', onDragSceneEnd);
  shortcut.off('fpsViewStart', onFpsViewStart);
  shortcut.off('fpsViewStop', onFpsViewStop);
  shortcut.off('mouseWheelMoveSceneCamera', onMouseWheelMoveSceneCamera);
  
  // 移除全局事件
  globalEmitter.off('editor.addSceneToolView', onAddSceneToolView);
  
  // 移除拖放功能
  if (dragContainer) {
    drag.unregister(dragContainer);
    if (dragContainer.parent) {
      dragContainer.parent.removeChild(dragContainer);
    }
    dragContainer = null;
  }
  
  // 清理 ResizeObserver
  if ((containerRef.value as any)?._resizeObserver) {
    (containerRef.value as any)._resizeObserver.disconnect();
  }
  
  // 停止渲染循环
  if (view.value && typeof (view.value as any).stop === 'function') {
    (view.value as any).stop();
  }
  
  // 清理 canvas
  if (canvas.value) {
    canvas.value.style.display = 'none';
    canvas.value.remove();
    canvas.value = null;
  }
  
  // 清理场景
  view.value = null;
  editorCamera.value = null;
});
</script>

<style scoped>
.scene-view {
  position: relative;
  width: 100%;
  height: 100%;
  /* 使用 Element Plus 主题变量 */
  background-color: var(--el-bg-color, #1e1e1e);
  overflow: hidden;
}

.scene-view canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: auto; /* 确保 canvas 可以接收鼠标事件 */
  z-index: 0; /* Canvas 在最底层，但要在容器内 */
  /* Canvas 需要接收所有鼠标事件以支持点选、框选、旋转等操作 */
}

.scene-back-rect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none; /* 不拦截鼠标事件，让 canvas 接收 */
  /* 注意：此元素仅用于布局，不接收鼠标事件 */
}

.scene-tool-view-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}
</style>

