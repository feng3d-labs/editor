# Agent 4 任务清单

> **Agent**: Agent 4  
> **优先级**: 🟢 低优先级  
> **预计时间**: 2-4 天

## 📋 任务总览

| 任务 | 复杂度 | 预计时间 | 状态 |
|------|--------|---------|------|
| TopView | ⭐⭐⭐ | 1-2 天 | ✅ 已完成 |
| ParticleEffectController | ⭐⭐ | 1-2 天 | ✅ 已完成 |
| HierarchyTreeItemRenderer | ⭐⭐⭐ | 1-2 天（待确认） | ✅ 已集成（无需实现） |

---

## 🎯 任务 1: TopView

### 基本信息
- **原文件**: `src/ui/TopView.ts`
- **Vue 实现**: `src/vue-app/components/TopView.vue`
- **复杂度**: ⭐⭐⭐
- **预计时间**: 1-2 天
- **优先级**: 🟢 低

### 说明
- 顶部视图包含菜单栏和工具栏
- 已有 TopMenuBar 和 TopToolBar，但 TopView 包含更多集成逻辑
- 需要整合 TopMenuBar 和 TopToolBar 的功能

### 功能需求
- [x] 整合 TopMenuBar 和 TopToolBar
- [x] 实现菜单列表显示（已在 TopMenuBar 中实现）
- [x] 实现工具按钮（移动、旋转、缩放等，已在 TopToolBar 中实现）
- [x] 实现播放控制按钮（已在 TopToolBar 中实现）
- [x] 实现项目名称显示（已在 TopMenuBar 中实现）
- [x] 实现帮助和设置按钮（已在 TopToolBar 中实现）

### 参考文件
- **原实现**: `src/ui/TopView.ts` (274 行)
- **相关组件**: `src/vue-app/components/TopMenuBar.vue` ✅
- **相关组件**: `src/vue-app/components/TopToolBar.vue` ✅

### 实现步骤
1. 阅读原实现，理解所有功能
2. 检查 TopMenuBar 和 TopToolBar 已实现的功能
3. 创建 TopView 组件，整合两个组件
4. 实现额外的集成逻辑
5. 样式适配

---

## 🎯 任务 2: ParticleEffectController

### 基本信息
- **原文件**: `src/ui/ParticleEffectController.ts`
- **Vue 实现**: `src/vue-app/components/ParticleEffectController.vue`
- **复杂度**: ⭐⭐
- **预计时间**: 1-2 天
- **优先级**: 🟢 低

### 功能需求
- [x] 播放/暂停按钮
- [x] 停止按钮
- [x] 播放速度输入
- [x] 播放时间显示
- [x] 粒子数量显示
- [x] 实时更新（使用 requestAnimationFrame）

### 参考文件
- **原实现**: `src/ui/ParticleEffectController.ts` (128 行)

### 实现步骤
1. 创建 Vue 组件文件
2. 实现控制按钮
3. 实现输入框和显示
4. 实现实时更新逻辑（使用 requestAnimationFrame）
5. 监听选中对象变化
6. 样式适配

### 技术要点
- 使用 `requestAnimationFrame` 替代 `ENTER_FRAME`
- 使用 `watch` 监听选中对象变化
- 使用 `onUnmounted` 清理定时器

---

## 🎯 任务 3: HierarchyTreeItemRenderer（待确认）

### 基本信息
- **原文件**: `src/ui/hierarchy/HierarchyTreeItemRenderer.ts`
- **Vue 实现**: 可能已集成到 `HierarchyView.vue`
- **复杂度**: ⭐⭐⭐
- **预计时间**: 1-2 天（如果未集成）
- **优先级**: 🟢 低

### 评估步骤
1. **检查现有实现**
   - [x] 仔细阅读 `HierarchyView.vue`
   - [x] 检查是否已实现树项渲染功能
   - [x] 检查是否使用 el-tree 或其他组件

2. **功能对比**
   - [x] 阅读 `HierarchyTreeItemRenderer.ts`
   - [x] 对比现有实现的功能
   - [x] 评估是否需要单独实现

3. **决策**
   - [x] 如果已实现：标记为"已集成，无需实现"
   - [ ] 如果未实现：实现 HierarchyTreeItemRenderer

### 评估结果
✅ **已集成，无需实现**

`HierarchyView.vue` 已经完整实现了 `HierarchyTreeItemRenderer.ts` 的所有功能：
- ✅ 树项渲染（使用 el-tree 的 template slot）
- ✅ 拖拽支持（draggable、allowDrop、allowDrag、onNodeDragStart、onNodeDrop）
- ✅ 右键菜单（onNodeRightClick、onTreeRightClick）
- ✅ 选择状态（onNodeClick、updateSelectedNode）
- ✅ 展开/折叠（expandedKeys、updateExpandedNodes）
- ✅ 双击事件（onNodeDoubleClick）

因此不需要单独实现 `HierarchyTreeItemRenderer` 组件。

### 如果决定实现

#### 功能需求
- [ ] 层级树项渲染
- [ ] 拖拽支持
- [ ] 右键菜单
- [ ] 选择状态
- [ ] 展开/折叠

#### 参考文件
- **原实现**: `src/ui/hierarchy/HierarchyTreeItemRenderer.ts` (147 行)
- **相关组件**: `src/vue-app/views/HierarchyView.vue` ✅

---

## 📝 实现检查清单

### 每个任务完成后
- [x] 功能完整性检查
- [x] 代码通过编译和 lint 检查
- [x] 样式适配深色主题
- [x] 使用 Element Plus CSS 变量
- [x] 更新 `VUE_MIGRATION_PROGRESS.md` 文档

---

## 📝 进度跟踪

### 当前状态
- **开始时间**: 2024-12-19
- **完成时间**: 2024-12-19
- **当前任务**: 全部完成 ✅

### 任务进度
- **TopView**: ✅ 已完成
- **ParticleEffectController**: ✅ 已完成
- **HierarchyTreeItemRenderer**: ✅ 已集成（无需实现）

---

**最后更新**: 2024-12-19
