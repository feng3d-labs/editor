<template>
  <div ref="containerRef" class="scene-view">
    <!-- 顶部工具栏 -->
    <div class="scene-toolbar">
      <TopToolBar />
    </div>

    <!-- Canvas 将通过 ref 动态管理 -->
    <!-- 背景区域用于鼠标事件检测 -->
    <div ref="backRectRef" class="scene-back-rect"></div>
    <!-- 工具视图容器 -->
    <div ref="toolViewContainerRef" class="scene-tool-view-container"></div>
    <!-- 性能统计工具容器 -->
    <div ref="statsContainerRef" class="scene-stats-container"></div>
    <!-- 场景旋转工具图层 -->
    <div ref="sceneRotateToolLayerRef" class="scene-rotate-tool-layer"></div>
    <!-- 粒子效果控制器 -->
    <ParticleEffectController />
    <!-- 相机预览组件（显示在场景界面右下角） -->
    <CameraPreview :parent-container="containerRef as any" />
    <!-- 区域选择矩形 -->
    <AreaSelectRect ref="areaSelectRectRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, markRaw } from 'vue';
import { Vector2, Camera, GameObject, Vector3, Matrix4x4, Stats, serialization, FPSController, Scene, RunEnvironment, loader, shortcut, globalEmitter, windowEventProxy, raycaster, ticker, PerspectiveLens, IEvent, watcher } from 'feng3d';
import * as TWEEN from '@tweenjs/tween.js';
import { EditorComponent } from '../../feng3d/EditorComponent';
import { EditorView } from '../../feng3d/EditorView';
import { GroundGrid } from '../../feng3d/GroundGrid';
import { hierarchy } from '../../feng3d/hierarchy/Hierarchy';
import { MRSTool } from '../../feng3d/mrsTool/MRSTool';
import { SceneRotateTool } from '../../feng3d/scene/SceneRotateTool';
import { EditorData } from '../../global/EditorData';
import { useEditorStore } from '../stores/editorStore';
import { sceneControlConfig } from '../../shortcut/Editorshortcut';
import { drag } from '../../ui/drag/Drag';
import { editorui } from '../../global/editorui';
import CameraPreview from '../components/CameraPreview.vue';
import AreaSelectRect from '../components/AreaSelectRect.vue';
import ParticleEffectController from '../components/ParticleEffectController.vue';
import TopToolBar from '../components/TopToolBar.vue';

const editorStore = useEditorStore();

// DOM 引用
const containerRef = ref<HTMLElement>();
const backRectRef = ref<HTMLElement>();
const toolViewContainerRef = ref<HTMLElement>();
const statsContainerRef = ref<HTMLElement>();
const sceneRotateToolLayerRef = ref<HTMLElement>();

// Stats 实例（每个 SceneView 独立）
const statsInstance = ref<Stats | null>(null);

// 3D 渲染相关
const canvas = ref<HTMLCanvasElement | null>(null);
const view = ref<any>(null); // EditorView
const editorCamera = ref<Camera | null>(null);
const areaSelectRectRef = ref<InstanceType<typeof AreaSelectRect> | null>(null);
const areaSelectStartPosition = ref<Vector2 | null>(null);

// 拖放容器
let dragContainer: HTMLElement | null = null;

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
    
    // 创建独立的 Stats 实例（不使用单例）
    if (statsContainerRef.value && !statsInstance.value) {
      statsInstance.value = markRaw(new Stats());
      if (statsInstance.value.dom) {
        statsContainerRef.value.appendChild(statsInstance.value.dom);
        // 设置初始样式
        statsInstance.value.dom.style.position = 'absolute';
        statsInstance.value.dom.style.left = '0px';
        statsInstance.value.dom.style.top = '0px';
        statsInstance.value.dom.style.zIndex = '10';
        statsInstance.value.dom.style.pointerEvents = 'none';
      }
      
    }
    
    // 创建 EditorView
    view.value = markRaw(new EditorView(canvas.value) as any);
    
    // 将 Stats 实例关联到 View
    if (view.value && statsInstance.value) {
      (view.value as any).statsInstance = statsInstance.value;
    }
    
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
    // 先设置场景旋转工具的容器（在设置 view 之前，因为 view 的 setter 会触发 load）
    if (sceneRotateToolLayerRef.value) {
      (sceneRotateTool as any).layerContainer = sceneRotateToolLayerRef.value;
    }
    // 然后设置 view（这会触发 load，此时 layerContainer 已经设置好了）
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
    
    // 如果 gameScene 已存在，立即设置 hierarchy.rootGameObject
    // 这样层级面板就能正确显示内容
    const gameScene = EditorData.editorData.gameScene;
    if (gameScene && gameScene.gameObject) {
      hierarchy.rootGameObject = gameScene.gameObject;
      console.log('SceneView: hierarchy.rootGameObject set to gameScene.gameObject');
    }
    
    // 确保 EditorView.render() 被调用一次，以同步场景状态
    if (view.value && typeof (view.value as any).render === 'function') {
      (view.value as any).render();
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
  
  // 更新 Stats 位置（相对于容器）
  if (statsInstance.value && statsInstance.value.dom) {
    statsInstance.value.dom.style.position = 'absolute';
    statsInstance.value.dom.style.left = '0px';
    statsInstance.value.dom.style.top = '0px';
    statsInstance.value.dom.style.zIndex = '10';
    statsInstance.value.dom.style.pointerEvents = 'none';
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
  
  if (areaSelectRectRef.value) {
    areaSelectRectRef.value.show(
      { x: areaSelectStartPosition.value.x, y: areaSelectStartPosition.value.y },
      { x: areaSelectEndPosition.x, y: areaSelectEndPosition.y }
    );
  }
  
  const gs = view.value.getObjectsInGlobalArea(areaSelectStartPosition.value, areaSelectEndPosition);
  const gs0 = gs.filter((g) => !!hierarchy.getNode(g)) as any as GameObject[];
  (editorStore as any).selectMultiObject(gs0);
}

// 区域选择结束
function onAreaSelectEnd() {
  areaSelectStartPosition.value = null;
  if (areaSelectRectRef.value) {
    areaSelectRectRef.value.hide();
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

// 监听 gameScene 变化的回调函数
function onGameSceneChanged(newScene: any) {
  if (newScene && newScene.gameObject && view.value) {
    hierarchy.rootGameObject = newScene.gameObject;
    console.log('SceneView: hierarchy.rootGameObject updated from gameScene change');
    // 触发一次渲染以同步状态
    if (typeof (view.value as any).render === 'function') {
      (view.value as any).render();
    }
  }
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
  
  // 监听 gameScene 变化，确保 hierarchy.rootGameObject 被设置
  watcher.watch(EditorData.editorData, 'gameScene', onGameSceneChanged);
  
  // 拖放功能
  if (containerRef.value) {
    dragContainer = containerRef.value;
    
    // 注册拖放功能
    drag.register(dragContainer as any, null, ['file_gameobject', 'file_script'], (dragdata) => {
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
  
  // 移除 gameScene 监听
  watcher.unwatch(EditorData.editorData, 'gameScene', onGameSceneChanged);
  
  // 移除拖放功能
  if (dragContainer) {
    drag.unregister(dragContainer as any);
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
  
  // 清理 Stats 实例
  if (statsInstance.value) {
    // 从 View 中移除 Stats 引用
    if (view.value) {
      (view.value as any).statsInstance = undefined;
    }
    
    // 移除 DOM 元素
    if (statsInstance.value.dom && statsInstance.value.dom.parentElement) {
      statsInstance.value.dom.parentElement.removeChild(statsInstance.value.dom);
    }
    statsInstance.value = null;
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
  /* 使用 VSCode 主题变量 */
  background-color: var(--editor-background);
  overflow: hidden;
  /* 定义工具栏高度，统一管理布局间距 */
  --toolbar-height: 22px;
  /* 工具栏下方内容与工具栏的间距 */
  --toolbar-spacing: 4px;
}

.scene-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--toolbar-height);
  z-index: 1000;
  pointer-events: auto;
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

.scene-stats-container {
  position: absolute;
  top: calc(var(--toolbar-height) + var(--toolbar-spacing));
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;
  overflow: visible;
}

.scene-rotate-tool-layer {
  position: absolute;
  top: calc(var(--toolbar-height) + var(--toolbar-spacing));
  right: 0;
  width: 80px;
  height: 80px;
  z-index: 20;
  pointer-events: auto;
  background: transparent;
  overflow: visible;
}
</style>

