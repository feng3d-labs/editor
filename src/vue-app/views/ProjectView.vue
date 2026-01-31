<template>
  <div class="project-view">
    <!-- 左侧：资源树 -->
    <div class="project-view-tree">
      <el-tree
        ref="treeRef"
        :data="processedTreeData"
        :props="treeProps"
        :default-expand-all="false"
        node-key="id"
        :highlight-current="true"
        @node-click="onTreeNodeClick"
        @node-contextmenu="onTreeNodeRightClick"
      >
        <template #default="{ node, data }">
          <div class="tree-node">
            <Icon
              :icon="data.isDirectory ? 'material-symbols:folder' : getFileIcon(data)"
              :size="16"
              style="margin-right: 4px"
            />
            <span>{{ data.label }}</span>
          </div>
        </template>
      </el-tree>
    </div>

    <!-- 右侧：文件列表 -->
    <div class="project-view-content">
      <!-- 文件夹路径导航 -->
      <div class="project-view-path">
        <el-breadcrumb separator=">">
          <el-breadcrumb-item
            v-for="(folder, index) in folderPath"
            :key="folder.asset.assetId"
            @click="onPathClick(folder)"
            style="cursor: pointer"
          >
            {{ folder.label }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 文件过滤 -->
      <div class="project-view-filter">
        <el-input
          v-model="includeFilter"
          placeholder="包含（正则）"
          clearable
          size="small"
          style="width: 150px; margin-right: 8px"
        >
          <template #prefix>
            <Icon icon="mdi:magnify" :size="14" />
          </template>
        </el-input>
        <el-input
          v-model="excludeFilter"
          placeholder="排除（正则）"
          clearable
          size="small"
          style="width: 150px"
        >
          <template #prefix>
            <Icon icon="mdi:filter-remove" :size="14" />
          </template>
        </el-input>
      </div>

      <!-- 文件列表 -->
      <div
        ref="fileListRef"
        class="project-view-filelist"
        @click="onFileListClick"
        @contextmenu="onFileListRightClick"
        @mousedown="onFileListMouseDown"
        @drop="onFileDrop"
        @dragover.prevent
        @dragenter.prevent
      >
        <div
          v-for="(file, index) in filteredFiles"
          :key="file.asset.assetId || index"
          :class="['file-item', { 'file-item-selected': isFileSelected(file) }]"
          @click.stop="onFileClick(file)"
          @dblclick="onFileDoubleClick(file)"
          @contextmenu.stop="onFileRightClick(file, $event)"
        >
          <div class="file-item-icon">
            <Icon
              :icon="file.isDirectory ? 'material-symbols:folder' : getFileIcon(file)"
              :size="24"
            />
          </div>
          <div class="file-item-label">{{ file.label }}</div>
        </div>
      </div>

      <!-- 文件路径显示 -->
      <div class="project-view-filepath">
        {{ selectedFilePath }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { globalEmitter, IEvent, windowEventProxy, Rectangle, Vector2, shortcut } from 'feng3d';
import { editorAsset } from '../../ui/assets/EditorAsset';
import { AssetNode } from '../../ui/assets/AssetNode';
import { useEditorStore } from '../stores/editorStore';
import Icon from '../components/Icon.vue';
import { registerProjectView, unregisterProjectView } from './ProjectViewAdapter';

const editorStore = useEditorStore();

// 树数据
const treeData = ref<AssetNode[]>([]);
const treeRef = ref();
const treeProps = {
  children: 'children',
  label: 'label',
};

// 为树节点添加 id 属性（el-tree 需要）
const processedTreeData = computed(() => {
  function addId(nodes: AssetNode[]): any[] {
    return nodes.map((node) => ({
      ...node,
      id: node.asset.assetId, // el-tree 的 node-key
      children: node.children && node.children.length > 0 ? addId(node.children) : undefined,
    }));
  }
  return addId(treeData.value);
});

// 文件列表
const fileListRef = ref<HTMLElement>();
const filteredFiles = ref<AssetNode[]>([]);
const includeFilter = ref('');
const excludeFilter = ref('');

// 文件夹路径
const folderPath = computed(() => {
  const path: AssetNode[] = [];
  let folder = editorAsset.showFloder;
  while (folder) {
    path.unshift(folder);
    folder = folder.parent;
  }
  return path;
});

// 选中的文件路径
const selectedFilePath = computed(() => {
  const selected = editorStore.selectedAssetNodes;
  if (selected.length > 0) {
    return selected.map((v) => (v.asset.assetName || v.label) + (v.asset.extenson || '')).join(', ');
  }
  return '';
});

// 区域选择
const areaSelectStartPosition = ref<Vector2 | null>(null);
const isAreaSelecting = ref(false);

// 初始化
function initList() {
  invalidateAssetTree();
  
  // 监听资源变化
  editorAsset.rootFile.on('openChanged', invalidateAssetTree);
  editorAsset.rootFile.on('added', invalidateAssetTree);
  editorAsset.rootFile.on('removed', invalidateAssetTree);
}

// 更新资源树
function invalidateAssetTree() {
  const folders = editorAsset.rootFile.getFolderList();
  treeData.value = folders;
  
  // 更新当前文件夹的文件列表
  updateFileList();
}

// 更新文件列表
function updateFileList() {
  const folder = editorAsset.showFloder;
  if (!folder) {
    filteredFiles.value = [];
    return;
  }

  const children = folder.children || [];
  
  // 应用过滤
  let files = children.filter((file) => {
    // 包含过滤
    if (includeFilter.value) {
      try {
        const includeReg = new RegExp(includeFilter.value);
        if (!includeReg.test(file.label)) {
          return false;
        }
      } catch (e) {
        // 正则表达式错误，忽略
      }
    }
    
    // 排除过滤
    if (excludeFilter.value) {
      try {
        const excludeReg = new RegExp(excludeFilter.value);
        if (excludeReg.test(file.label)) {
          return false;
        }
      } catch (e) {
        // 正则表达式错误，忽略
      }
    }
    
    return true;
  });
  
  // 排序：文件夹在前，然后按名称排序
  files = files.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    return a.label.localeCompare(b.label);
  });
  
  filteredFiles.value = files;
}

// 获取文件图标
function getFileIcon(file: AssetNode): string {
  if (file.isDirectory) {
    return 'material-symbols:folder';
  }
  
  // 根据文件扩展名返回图标
  const ext = file.asset.extenson?.toLowerCase() || '';
  const iconMap: Record<string, string> = {
    '.js': 'vscode-icons:file-type-js',
    '.ts': 'vscode-icons:file-type-typescript',
    '.json': 'vscode-icons:file-type-json',
    '.vue': 'vscode-icons:file-type-vue',
    '.html': 'vscode-icons:file-type-html',
    '.css': 'vscode-icons:file-type-css',
    '.png': 'vscode-icons:file-type-image',
    '.jpg': 'vscode-icons:file-type-image',
    '.jpeg': 'vscode-icons:file-type-image',
    '.gif': 'vscode-icons:file-type-image',
    '.svg': 'vscode-icons:file-type-svg',
  };
  
  return iconMap[ext] || 'vscode-icons:default-file';
}

// 树节点点击
function onTreeNodeClick(data: any) {
  // data 可能是处理后的对象，需要获取原始 AssetNode
  const node = data as AssetNode;
  if (node.isDirectory) {
    editorAsset.showFloder = node;
  }
}

// 树节点右键
function onTreeNodeRightClick(event: MouseEvent, data: any) {
  event.preventDefault();
  editorAsset.popupmenu(data);
}

// 路径点击
function onPathClick(folder: AssetNode) {
  editorAsset.showFloder = folder;
}

// 文件点击
function onFileClick(file: AssetNode) {
  editorStore.selectObject(file);
}

// 文件双击
function onFileDoubleClick(file: AssetNode) {
  if (file.isDirectory) {
    editorAsset.showFloder = file;
  } else {
    // 打开文件（根据文件类型处理）
    // TODO: 实现文件打开逻辑
  }
}

// 文件右键
function onFileRightClick(file: AssetNode, event: MouseEvent) {
  event.preventDefault();
  editorStore.selectObject(file);
  editorAsset.popupmenu(file);
}

// 文件列表点击（空白处）
function onFileListClick(event: MouseEvent) {
  if (event.target === fileListRef.value) {
    editorStore.clearSelectedObjects();
  }
}

// 文件列表右键（空白处）
function onFileListRightClick(event: MouseEvent) {
  event.preventDefault();
  editorStore.clearSelectedObjects();
  editorAsset.popupmenu(editorAsset.showFloder);
}

// 文件列表鼠标按下（区域选择）
function onFileListMouseDown(event: MouseEvent) {
  if (event.target !== fileListRef.value) return;
  if (shortcut.getState('splitGroupDraging')) return;
  
  areaSelectStartPosition.value = new Vector2(windowEventProxy.clientX, windowEventProxy.clientY);
  isAreaSelecting.value = true;
  
  windowEventProxy.on('mousemove', onMouseMove);
  windowEventProxy.on('mouseup', onMouseUp);
}

// 鼠标移动（区域选择）
function onMouseMove() {
  if (!isAreaSelecting.value || !areaSelectStartPosition.value || !fileListRef.value) return;
  
  const endPosition = new Vector2(windowEventProxy.clientX, windowEventProxy.clientY);
  const rect = fileListRef.value.getBoundingClientRect();
  
  // 限制在选择区域内
  const clampedEnd = new Vector2(
    Math.max(rect.left, Math.min(rect.right, endPosition.x)),
    Math.max(rect.top, Math.min(rect.bottom, endPosition.y))
  );
  
  // TODO: 显示选择矩形
  // 计算选中的文件
  const min = areaSelectStartPosition.value.clone().min(clampedEnd);
  const max = areaSelectStartPosition.value.clone().max(clampedEnd);
  const areaRect = new Rectangle(min.x, min.y, max.x - min.x, max.y - min.y);
  
  // 获取选中的文件（需要根据实际渲染位置计算）
  // 这里简化处理，实际需要根据文件项的实际位置判断
  const selectedFiles: AssetNode[] = [];
  // TODO: 实现区域选择逻辑
  
  if (selectedFiles.length > 0) {
    editorStore.selectMultiObject(selectedFiles);
  }
}

// 鼠标释放
function onMouseUp() {
  isAreaSelecting.value = false;
  areaSelectStartPosition.value = null;
  windowEventProxy.off('mousemove', onMouseMove);
  windowEventProxy.off('mouseup', onMouseUp);
}

// 文件拖拽
function onFileDrop(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
  
  const dt = event.dataTransfer;
  if (!dt) return;
  
  const fileList = dt.files;
  const files: File[] = [];
  for (let i = 0; i < fileList.length; i++) {
    files.push(fileList[i]);
  }
  
  if (files.length > 0) {
    editorAsset.inputFiles(files);
  }
}

// 判断文件是否被选中
function isFileSelected(file: AssetNode): boolean {
  return editorStore.selectedAssetNodes.some(
    (node) => node.asset.assetId === file.asset.assetId
  );
}

// 监听选中变化
function onSelectedObjectsChanged() {
  // 更新文件路径显示
  // 已通过 computed 自动更新
}

// 监听显示文件夹变化
watch(
  () => editorAsset.showFloder,
  () => {
    updateFileList();
    // 更新树节点选中状态
    nextTick(() => {
      if (treeRef.value && editorAsset.showFloder) {
        // 使用 assetId 作为 node-key
        treeRef.value.setCurrentKey(editorAsset.showFloder.asset.assetId);
      }
    });
  },
  { immediate: true }
);

// 监听过滤变化
watch([includeFilter, excludeFilter], () => {
  updateFileList();
});

onMounted(() => {
  initList();
  
  // 注册适配器，支持旧代码调用
  registerProjectView({
    invalidateAssettree,
  });
  
  globalEmitter.on('editor.selectedObjectsChanged', onSelectedObjectsChanged);
  globalEmitter.on('asset.showAsset', () => {
    // TODO: 处理显示资源
  });
  globalEmitter.on('projectview.invalidateAssettree', invalidateAssettree);
});

onUnmounted(() => {
  // 注销适配器
  unregisterProjectView();
  
  editorAsset.rootFile.off('openChanged', invalidateAssetTree);
  editorAsset.rootFile.off('added', invalidateAssetTree);
  editorAsset.rootFile.off('removed', invalidateAssetTree);
  
  globalEmitter.off('editor.selectedObjectsChanged', onSelectedObjectsChanged);
  globalEmitter.off('asset.showAsset', () => {});
  globalEmitter.off('projectview.invalidateAssettree', invalidateAssetTree);
  
  if (isAreaSelecting.value) {
    onMouseUp();
  }
});
</script>

<style scoped>
.project-view {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  /* 使用 Element Plus 主题变量 */
  background-color: var(--el-bg-color, #1e1e1e);
  color: var(--el-text-color-primary, #cccccc);
}

.project-view-tree {
  width: 200px;
  min-width: 150px;
  border-right: 1px solid var(--el-border-color, #3d3d3d);
  overflow-y: auto;
  padding: 8px;
}

.project-view-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.project-view-path {
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color, #3d3d3d);
  /* 使用 Element Plus 主题变量 */
  background-color: var(--el-bg-color-overlay, #2d2d2d);
}

.project-view-filter {
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color, #3d3d3d);
  display: flex;
  align-items: center;
  /* 使用 Element Plus 主题变量 */
  background-color: var(--el-bg-color-overlay, #2d2d2d);
}

.project-view-filelist {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  align-content: start;
}

.file-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  /* 使用 Element Plus 主题变量 */
  background-color: var(--el-bg-color-overlay, #2d2d2d);
  border: 1px solid transparent;
}

.file-item:hover {
  /* 使用 Element Plus 主题变量 */
  background-color: var(--el-fill-color, #2d2d2d);
  border-color: var(--el-border-color, #3d3d3d);
}

.file-item-selected {
  /* 使用 Element Plus 主题变量 */
  background-color: var(--el-fill-color-dark, #3d3d3d);
  border-color: var(--el-color-primary, #007acc);
}

.file-item-icon {
  margin-bottom: 4px;
}

.file-item-label {
  font-size: 12px;
  text-align: center;
  word-break: break-all;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  /* 使用 Element Plus 主题变量 */
  color: var(--el-text-color-primary, #cccccc);
}

.project-view-filepath {
  padding: 4px 12px;
  font-size: 12px;
  border-top: 1px solid var(--el-border-color, #3d3d3d);
  /* 使用 Element Plus 主题变量 */
  background-color: var(--el-bg-color-overlay, #2d2d2d);
  color: var(--el-text-color-secondary, #666666);
}

.tree-node {
  display: flex;
  align-items: center;
  flex: 1;
}

/* Element Plus Tree 样式覆盖 */
:deep(.el-tree) {
  background-color: transparent;
  color: var(--el-text-color-primary, #cccccc);
}

:deep(.el-tree-node__content) {
  color: var(--el-text-color-primary, #cccccc);
}

:deep(.el-tree-node__content:hover) {
  background-color: var(--el-fill-color, #2d2d2d);
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: var(--el-fill-color-dark, #3d3d3d);
  color: var(--el-color-primary, #007acc);
}

/* Element Plus Breadcrumb 样式覆盖 */
:deep(.el-breadcrumb) {
  font-size: 12px;
}

:deep(.el-breadcrumb__inner) {
  color: var(--el-text-color-primary, #cccccc);
}

:deep(.el-breadcrumb__inner:hover) {
  color: var(--el-color-primary, #007acc);
}
</style>

