<template>
  <div class="hierarchy-view">
    <el-tree
      ref="treeRef"
      :data="treeData"
      :props="treeProps"
      :default-expand-all="false"
      :default-expanded-keys="expandedKeys"
      node-key="id"
      :highlight-current="true"
      @node-click="onNodeClick"
      @node-contextmenu="onNodeRightClick"
      @node-dblclick="onNodeDoubleClick"
    >
      <template #default="{ node, data }">
        <div class="tree-node">
          <Icon
            :icon="getNodeIcon(data)"
            :size="16"
            style="margin-right: 4px"
          />
          <span>{{ data.label }}</span>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { globalEmitter, watcher, shortcut, GameObject, serialization, windowEventProxy } from 'feng3d';
import { hierarchy } from '../../feng3d/hierarchy/Hierarchy';
import { HierarchyNode } from '../../feng3d/hierarchy/HierarchyNode';
import { useEditorStore } from '../stores/editorStore';
import { menuConfig } from '../../configs/CommonConfig';
import { MenuAdapter, type MenuItem } from '../components/MenuAdapter';
import Icon from '../components/Icon.vue';

// 创建 Menu 适配器实例
const menu = new MenuAdapter();

const editorStore = useEditorStore();

// 树数据
const treeData = ref<any[]>([]);
const treeRef = ref();
const expandedKeys = ref<string[]>([]);
const treeProps = {
  children: 'children',
  label: 'label',
};

// 更新层级树
function updateHierarchyTree() {
  if (!hierarchy.rootnode) {
    treeData.value = [];
    return;
  }
  
  // 转换为 el-tree 需要的格式
  function convertNode(node: HierarchyNode): any {
    // 使用 gameobject 的 uuid 作为唯一标识
    const id = node.gameobject.uuid;
    return {
      ...node,
      id, // 使用 uuid 作为唯一标识
      label: node.label || node.gameobject.name,
      children: node.children && node.children.length > 0 
        ? node.children.map(convertNode) 
        : undefined,
    };
  }
  
  // el-tree 需要树形结构，只使用根节点的直接子节点
  // 而不是使用 getShowNodes() 返回的扁平化数组
  treeData.value = hierarchy.rootnode.children 
    ? hierarchy.rootnode.children.map(convertNode)
    : [];
  
  // 更新展开状态
  nextTick(() => {
    updateExpandedNodes();
  });
}

// 更新展开的节点
function updateExpandedNodes() {
  if (!hierarchy.rootnode) {
    expandedKeys.value = [];
    return;
  }
  
  const keys: string[] = [];
  
  function collectExpandedKeys(node: HierarchyNode) {
    if (node.isOpen) {
      keys.push(node.gameobject.uuid);
    }
    
    if (node.children) {
      node.children.forEach(collectExpandedKeys);
    }
  }
  
  collectExpandedKeys(hierarchy.rootnode);
  expandedKeys.value = keys;
  
  // 如果组件已初始化，也尝试调用 setExpandedKeys（如果可用）
  if (treeRef.value && typeof treeRef.value.setExpandedKeys === 'function') {
    try {
      treeRef.value.setExpandedKeys(keys);
    } catch (error) {
      console.warn('Failed to set expanded keys via method:', error);
    }
  }
}

// 使层级树无效（触发更新）
function invalidHierarchy() {
  // 使用 nextTick 确保在下一帧更新
  nextTick(() => {
    updateHierarchyTree();
  });
}

// 监听根节点变化
function onRootNodeChanged() {
  invalidHierarchy();
}

// 监听根节点事件
function onRootNode(node: HierarchyNode) {
  if (node) {
    node.on('added', invalidHierarchy);
    node.on('removed', invalidHierarchy);
    node.on('openChanged', invalidHierarchy);
  }
}

// 取消监听根节点事件
function offRootNode(node: HierarchyNode) {
  if (node) {
    node.off('added', invalidHierarchy);
    node.off('removed', invalidHierarchy);
    node.off('openChanged', invalidHierarchy);
  }
}

// 获取节点图标
function getNodeIcon(data: any): string {
  // 可以根据 GameObject 的类型返回不同的图标
  // 这里简化处理，统一使用游戏对象图标
  return 'material-symbols:category';
}

// 树节点点击
function onNodeClick(data: any) {
  const node = data as HierarchyNode;
  if (node && node.gameobject) {
    editorStore.selectObject(node.gameobject);
  }
}

// 树节点双击
function onNodeDoubleClick(data: any) {
  const node = data as HierarchyNode;
  if (node && node.gameobject) {
    shortcut.emit('lookToSelectedGameObject');
  }
}

// 树节点右键
function onNodeRightClick(event: MouseEvent, data: any) {
  event.preventDefault();
  
  const node = data as HierarchyNode;
  if (!node || !node.gameobject) return;
  
  // 选中节点
  editorStore.selectObject(node.gameobject);
  
  // 构建右键菜单
  const menus: MenuItem[] = [];
  
  // scene 无法删除
  if (node.gameobject.scene.gameObject !== node.gameobject) {
    menus.push(
      {
        label: '复制',
        click: () => {
          const objects = editorStore.selectedGameObjects;
          editorStore.copyObjects = objects;
        },
      },
      {
        label: '粘贴',
        click: () => {
          const undoSelectedObjects = editorStore.selectedObjects;
          const objects = editorStore.copyObjects.filter((v) => v instanceof GameObject);
          if (objects.length === 0) return;
          
          const newGameObjects = objects.map((v) => serialization.clone(v));
          newGameObjects.forEach((v) => {
            node.gameobject.parent.addChild(v);
          });
          editorStore.selectMultiObject(newGameObjects);
          
          // undo
          editorStore.undoList.push(() => {
            newGameObjects.forEach((v) => {
              v.remove();
            });
            editorStore.selectMultiObject(undoSelectedObjects as any, false);
          });
        },
      },
      { type: 'separator' },
      {
        label: '副本',
        click: () => {
          const undoSelectedObjects = [...editorStore.selectedObjects] as any;
          const objects = editorStore.selectedGameObjects;
          const newGameObjects = objects.map((v) => {
            const no = serialization.clone(v);
            v.parent.addChild(no);
            return no;
          });
          editorStore.selectMultiObject(newGameObjects);
          
          // undo
          editorStore.undoList.push(() => {
            newGameObjects.forEach((v) => {
              v.remove();
            });
            editorStore.selectMultiObject(undoSelectedObjects as any, false);
          });
        },
      },
      {
        label: '删除',
        click: () => {
          node.gameobject.parent.removeChild(node.gameobject);
          const index = editorStore.selectedObjects.indexOf(node.gameobject);
          if (index !== -1) {
            const selectedObjects = [...editorStore.selectedObjects];
            selectedObjects.splice(index, 1);
            editorStore.selectMultiObject(selectedObjects as Array<GameObject | import('../../ui/assets/AssetNode').AssetNode>);
          }
        },
      }
    );
  }
  
  menus.push({ type: 'separator' }, ...menuConfig.getCreateObjectMenu());
  
  if (menus.length > 0) {
    menu.popup(menus);
  }
}

// 树列表点击（空白处）
function onTreeClick(event: MouseEvent) {
  if (event.target === treeRef.value?.$el) {
    editorStore.selectObject(null);
  }
}

// 树列表右键（空白处）
function onTreeRightClick(event: MouseEvent) {
  if (event.target === treeRef.value?.$el) {
    event.preventDefault();
    editorStore.selectObject(null);
    menu.popup(menuConfig.getCreateObjectMenu());
  }
}

// 监听 hierarchy.rootnode 变化
watch(
  () => hierarchy.rootnode,
  (newNode, oldNode) => {
    offRootNode(oldNode);
    onRootNode(newNode);
    invalidHierarchy();
  },
  { immediate: true }
);

// 监听 gameScene 变化，确保 hierarchy.rootnode 被初始化
watch(
  () => (editorStore as any).gameScene,
  (newScene) => {
    if (newScene && !hierarchy.rootnode) {
      // 如果 gameScene 已设置但 rootnode 还未初始化，等待 EditorView.render() 设置
      // 这里可以触发一次更新检查
      setTimeout(() => {
        if (hierarchy.rootnode) {
          invalidHierarchy();
        }
      }, 100);
    }
  },
  { immediate: true }
);

onMounted(() => {
  // 初始化
  if (hierarchy.rootnode) {
    onRootNode(hierarchy.rootnode);
    invalidHierarchy();
  }
  
  // 监听根节点变化
  watcher.watch(hierarchy, 'rootnode', onRootNodeChanged);
  
  // 监听选中对象变化，更新树节点高亮
  globalEmitter.on('editor.selectedObjectsChanged', () => {
    nextTick(() => {
      updateSelectedNode();
    });
  });
});

onUnmounted(() => {
  watcher.unwatch(hierarchy, 'rootnode', onRootNodeChanged);
  if (hierarchy.rootnode) {
    offRootNode(hierarchy.rootnode);
  }
  globalEmitter.off('editor.selectedObjectsChanged', () => {});
});

// 更新选中的节点
function updateSelectedNode() {
  if (!treeRef.value) return;
  
  const selectedNode = hierarchy.getSelectedNode();
  if (selectedNode) {
    treeRef.value.setCurrentKey(selectedNode.gameobject.uuid);
  } else {
    treeRef.value.setCurrentKey(null);
  }
}
</script>

<style scoped>
.hierarchy-view {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  /* 使用 Element Plus 主题变量 */
  background-color: var(--el-bg-color, #1e1e1e);
  color: var(--el-text-color-primary, #cccccc);
  padding: 8px;
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
  height: 24px;
}

:deep(.el-tree-node__content:hover) {
  background-color: var(--el-fill-color, #2d2d2d);
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: var(--el-fill-color-dark, #3d3d3d);
  color: var(--el-color-primary, #007acc);
}
</style>

