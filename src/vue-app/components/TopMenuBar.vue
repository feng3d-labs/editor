<template>
  <div class="top-menu-bar">
    <!-- 菜单项列表 -->
    <div class="menu-items">
      <div
        v-for="(item, index) in menuItems"
        :key="index"
        :class="['menu-item', {
          'menu-item-active': activeMenuIndex === index
        }]"
        @click="onMenuItemClick(item, index, $event)"
        @mouseenter="onMenuItemMouseEnter(index)"
        @mouseleave="onMenuItemMouseLeave"
      >
        <span class="menu-item-label">{{ item.label }}</span>
      </div>
    </div>
    
    <!-- 项目名称（居中显示） -->
    <div class="project-name">
      <span>{{ projectName }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { globalEmitter, IEvent } from 'feng3d';
import { menuConfig } from '../../configs/CommonConfig';
import { menu } from '../../ui/components/Menu';
import { editorcache } from '../../caches/Editorcache';

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

// 获取菜单项
function getMenuItems() {
  const mainMenu = menuConfig.getMainMenu();
  // 过滤掉分隔符，只显示有 label 的菜单项
  const items = mainMenu.filter((item) => item.type !== 'separator' && item.label);
  
  // 处理菜单显示逻辑（与 Egret 版本一致）
  const processedItems = items.map((item) => {
    const menuItem = menu.handleShow({ submenu: [item] });
    return menuItem.submenu?.[0] || item;
  });
  
  return processedItems;
}

// 菜单项点击
function onMenuItemClick(item: MenuItem, index: number, event: MouseEvent) {
  if (!item.submenu || item.submenu.length === 0) return;
  
  // 计算菜单位置（在菜单项下方）
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  
  // 显示菜单
  globalEmitter.emit('menu.show', {
    items: item.submenu,
    x: rect.left,
    y: rect.bottom,
  } as any);
  
  activeMenuIndex.value = index;
}

// 菜单项鼠标进入
function onMenuItemMouseEnter(index: number) {
  // 可以在这里添加悬停效果
}

// 菜单项鼠标离开
function onMenuItemMouseLeave() {
  // 可以在这里移除悬停效果
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
  height: 22px;
  background-color: #ffffff;
  border-bottom: 1px solid var(--el-border-color, #e4e7ed);
  display: flex;
  align-items: center;
  z-index: 1000;
}

.menu-items {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 0;
}

.menu-item {
  position: relative;
  padding: 0 12px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  color: #000000;
  font-size: 12px;
  min-width: 40px;
}

.menu-item:hover {
  background-color: #cce8ff;
}

.menu-item-active {
  background-color: #cce8ff;
}

.menu-item-label {
  text-align: center;
  white-space: nowrap;
}

.project-name {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  color: #000000;
  font-size: 12px;
  pointer-events: none;
  user-select: none;
}
</style>

