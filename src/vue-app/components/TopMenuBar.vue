<template>
  <div class="top-menu-bar">
    <!-- 使用 Element Plus Menu 组件 -->
    <el-menu
      mode="horizontal"
      :default-active="activeMenuIndex >= 0 ? String(activeMenuIndex) : ''"
      class="top-menu-bar-menu"
      :ellipsis="false"
    >
      <el-menu-item
        v-for="(item, index) in menuItems"
        :key="index"
        :index="String(index)"
        :ref="el => setMenuItemRef(el, index)"
        @click="onMenuItemClick(item, index)"
      >
        <span class="menu-item-label">{{ item.label }}</span>
      </el-menu-item>
    </el-menu>

    <!-- 项目名称（居中显示） -->
    <div class="project-name">
      <span>{{ projectName }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { globalEmitter } from 'feng3d';
import { menuConfig } from '../../configs/CommonConfig';
import { MenuAdapter } from './MenuAdapter';
import { editorcache } from '../../caches/Editorcache';

// 创建 MenuAdapter 实例
const menuAdapter = new MenuAdapter();

// 菜单项类型
interface MenuItem {
  label?: string;
  priority?: number;
  type?: 'separator';
  click?: () => void;
  submenu?: MenuItem[];
  enable?: boolean;
  show?: boolean;
}

// 状态
const activeMenuIndex = ref<number>(-1);
const menuItems = ref<MenuItem[]>([]);
const projectName = ref<string>('newproject');
const menuItemRefs = ref<Map<number, any>>(new Map());

// 获取菜单项
function getMenuItems() {
  const mainMenu = menuConfig.getMainMenu();
  // 过滤掉分隔符，只显示有 label 的菜单项
  const items = mainMenu.filter((item) => item.type !== 'separator' && item.label);

  // 处理菜单显示逻辑
  const processedItems = items.map((item) => {
    const menuItem = menuAdapter.handleShow({ submenu: [item] });
    return menuItem.submenu?.[0] || item;
  });

  return processedItems;
}

// 设置菜单项 ref
function setMenuItemRef(el: any, index: number) {
  if (el) {
    menuItemRefs.value.set(index, el);
  } else {
    menuItemRefs.value.delete(index);
  }
}

// 菜单项点击
function onMenuItemClick(item: MenuItem, index: number) {
  if (!item.submenu || item.submenu.length === 0) return;

  // 从 ref 中获取菜单项元素
  const menuItemRef = menuItemRefs.value.get(index);
  if (!menuItemRef) return;

  // Element Plus 的 menu-item 组件，需要获取其 $el 属性
  const target = menuItemRef.$el || menuItemRef;
  if (!target || !target.getBoundingClientRect) return;

  const rect = target.getBoundingClientRect();

  // 显示菜单
  globalEmitter.emit('menu.show', {
    items: item.submenu,
    x: rect.left,
    y: rect.bottom,
  } as any);

  activeMenuIndex.value = index;
}

// 监听菜单关闭事件
function onMenuHide() {
  activeMenuIndex.value = -1;
}

// 更新项目名称
function updateProjectName() {
  projectName.value = editorcache.projectname || 'newproject';
}

onMounted(() => {
  // 初始化菜单项
  menuItems.value = getMenuItems();
  
  // 更新项目名称
  updateProjectName();
  
  // 监听菜单关闭事件
  globalEmitter.on('menu.hide', onMenuHide);
  
  // 监听项目名称变化（如果有的话）
  // 这里可以根据实际需求添加监听
});

onUnmounted(() => {
  globalEmitter.off('menu.hide', onMenuHide);
});
</script>

<style scoped>
.top-menu-bar {
  position: relative;
  width: 100%;
  height: 32px;
  background-color: transparent;
  display: flex;
  align-items: center;
  z-index: 1000;
  padding: 0 8px;
  box-sizing: border-box;
}

/* Element Plus Menu 样式覆盖 */
.top-menu-bar-menu {
  background-color: transparent;
  border-bottom: none;
  height: 100%;
  flex: 1;
  overflow: visible;
}

.top-menu-bar-menu :deep(.el-menu--horizontal) {
  border-bottom: none;
}

.top-menu-bar-menu :deep(.el-menu-item) {
  height: 32px;
  line-height: 32px;
  padding: 0 12px;
  font-size: 12px;
  color: var(--el-text-color-primary);
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.top-menu-bar-menu :deep(.el-menu-item:hover) {
  background-color: transparent;
  color: var(--el-color-primary);
  border-bottom-color: var(--el-color-primary);
}

.top-menu-bar-menu :deep(.el-menu-item.is-active) {
  color: var(--el-color-primary);
  border-bottom-color: var(--el-color-primary);
  background-color: transparent;
}

.menu-item-label {
  text-align: center;
  white-space: nowrap;
}

.project-name {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  color: var(--el-text-color-primary);
  font-size: 12px;
  pointer-events: none;
  user-select: none;
  font-weight: 500;
}
</style>

