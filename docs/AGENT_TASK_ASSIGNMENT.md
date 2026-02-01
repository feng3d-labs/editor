# Agent 任务分配

> **创建时间**: 2024-12-19  
> **目标**: 将待实现的 Vue 组件迁移任务分配给多个 agent 并行完成

## 📋 任务分配总览

| Agent | 任务数量 | 预计时间 | 优先级 | 状态 | 任务文档 |
|-------|---------|---------|--------|------|---------|
| **Agent 1** | 1 | 4-5 天 | 🔴 高 | ⏳ 待开始 | [详细任务](./AGENT_1_TASKS.md) |
| **Agent 2** | 3 | 3-5 天 | 🟡 中 | ⏳ 待开始 | [详细任务](./AGENT_2_TASKS.md) |
| **Agent 3** | 3 | 2-4 天 | 🟢 低 | ⏳ 待开始 | [详细任务](./AGENT_3_TASKS.md) |
| **Agent 4** | 3 | 2-4 天 | 🟢 低 | ⏳ 待开始 | [详细任务](./AGENT_4_TASKS.md) |
| **Agent 5** | 2 | 1-2 天 | 🟢 低 | ⏳ 待开始 | [详细任务](./AGENT_5_TASKS.md) |

---

## 📖 快速导航

每个 Agent 都有独立的任务文档，包含详细的实现步骤和检查清单：

- **[Agent 1 任务清单](./AGENT_1_TASKS.md)** - MinMaxCurveEditor（高优先级）
- **[Agent 2 任务清单](./AGENT_2_TASKS.md)** - TabView, SplitGroup, TreeItemRenderer（评估类）
- **[Agent 3 任务清单](./AGENT_3_TASKS.md)** - ColorPicker, LoadingUI, NavigationView
- **[Agent 4 任务清单](./AGENT_4_TASKS.md)** - TopView, ParticleEffectController, HierarchyTreeItemRenderer
- **[Agent 5 任务清单](./AGENT_5_TASKS.md)** - AssetFileItemRenderer, AssetTreeItemRenderer（待确认）

---

## 🤖 Agent 1: 高级编辑器（高优先级）

> 📄 **详细任务文档**: [AGENT_1_TASKS.md](./AGENT_1_TASKS.md)

### 任务 1: MinMaxCurveEditor
- **文件**: `src/ui/components/MinMaxCurveEditor.ts`
- **Vue 实现**: `src/vue-app/components/MinMaxCurveEditor.vue`
- **复杂度**: ⭐⭐⭐⭐⭐
- **预计时间**: 4-5 天
- **优先级**: 🔴 高

#### 功能需求
- [ ] Canvas 绘制曲线和网格
- [ ] 关键点添加/删除/拖拽
- [ ] 控制点编辑（切线调整）
- [ ] WrapMode 设置（Clamp、Loop、PingPong）
- [ ] 预设曲线选择
- [ ] 双曲线模式支持

#### 依赖
- MinMaxCurveView（已完成）✅

#### 参考文件
- 原实现: `src/ui/components/MinMaxCurveEditor.ts`
- 相关组件: `src/vue-app/components/MinMaxCurveView.vue`
- 相关组件: `src/vue-app/objectview/oav/OAVMinMaxCurve.vue`

#### 实现步骤
1. 阅读原 Egret 实现代码，理解功能逻辑
2. 创建 Vue 组件文件 `MinMaxCurveEditor.vue`
3. 实现 Canvas 绘制（曲线、网格、关键点）
4. 实现鼠标交互（拖拽、点击、右键菜单）
5. 实现关键点编辑功能
6. 实现控制点（切线）编辑
7. 实现 WrapMode 切换
8. 实现预设曲线选择
9. 实现双曲线模式
10. 样式适配（深色主题）
11. 测试和调试

#### 注意事项
- 这是最复杂的组件，需要仔细处理 Canvas 绘制和交互
- 参考 MinMaxCurveView 的实现方式
- 确保与现有 OAVMinMaxCurve 组件兼容

---

## 🤖 Agent 2: 中优先级组件（评估类）

> 📄 **详细任务文档**: [AGENT_2_TASKS.md](./AGENT_2_TASKS.md)

### 任务 1: TabView
- **文件**: `src/ui/components/TabView.ts`
- **Vue 实现**: `src/vue-app/components/TabView.vue`
- **复杂度**: ⭐⭐⭐⭐
- **预计时间**: 3-4 天
- **优先级**: 🟡 中（待评估）

#### 说明
- 主要用于旧布局系统（MainSplitView），新系统已用 TabPanel 替代
- 涉及模块管理、拖拽、SplitGroup 集成、右键菜单等复杂功能
- **建议**: 如果旧布局系统不再使用，可以跳过实现

#### 实现步骤
1. 检查 `MainSplitView.ts` 是否还在使用
2. 检查新系统是否完全替代了旧布局
3. 如果仍在使用，则实现 TabView
4. 如果不再使用，标记为"已废弃，无需实现"

### 任务 2: SplitGroup / SplitUIComponent
- **文件**: `src/ui/components/SplitGroup.ts` / `src/ui/components/SplitUIComponent.ts`
- **Vue 实现**: `src/vue-app/components/SplitGroup.vue`
- **复杂度**: ⭐⭐
- **预计时间**: 1-2 天
- **优先级**: 🟡 中（待评估）

#### 说明
- 已有 SplitPanel，可能需要统一
- 需要评估 SplitGroup 和 SplitPanel 的功能差异

#### 实现步骤
1. 对比 SplitGroup 和 SplitPanel 的功能
2. 如果功能重复，统一使用 SplitPanel
3. 如果有差异，实现 SplitGroup

### 任务 3: TreeItemRenderer / TreeNode
- **文件**: `src/ui/components/TreeItemRenderer.ts` / `src/ui/components/TreeNode.ts`
- **Vue 实现**: `src/vue-app/components/TreeItemRenderer.vue`
- **复杂度**: ⭐⭐
- **预计时间**: 1-2 天
- **优先级**: 🟡 中（待评估）

#### 说明
- 如果使用 Element Plus 的 el-tree，可能不需要
- 需要检查现有 Vue 组件是否已使用 el-tree

#### 实现步骤
1. 检查 HierarchyView.vue 和 ProjectView.vue 是否已使用 el-tree
2. 如果已使用，标记为"已替代，无需实现"
3. 如果未使用，实现 TreeItemRenderer

---

## 🤖 Agent 3: 低优先级组件组 A

> 📄 **详细任务文档**: [AGENT_3_TASKS.md](./AGENT_3_TASKS.md)

### 任务 1: ColorPicker
- **文件**: `src/ui/components/ColorPicker.ts`
- **Vue 实现**: `src/vue-app/components/ColorPicker.vue`
- **复杂度**: ⭐⭐
- **预计时间**: 1 天
- **优先级**: 🟢 低

#### 说明
- 简单的颜色选择按钮组件（不是 ColorPickerView）
- 点击后弹出 ColorPickerView

#### 参考文件
- 原实现: `src/ui/components/ColorPicker.ts`
- 相关组件: `src/vue-app/components/ColorPickerView.vue` ✅

### 任务 2: LoadingUI
- **文件**: `src/ui/LoadingUI.ts`
- **Vue 实现**: `src/vue-app/components/LoadingUI.vue`
- **复杂度**: ⭐
- **预计时间**: 0.5 天
- **优先级**: 🟢 低

#### 说明
- 资源加载进度界面，用于 Egret 资源加载
- 简单的文本显示组件

#### 参考文件
- 原实现: `src/ui/LoadingUI.ts`

### 任务 3: NavigationView
- **文件**: `src/ui/NavigationView.ts`
- **Vue 实现**: `src/vue-app/views/NavigationView.vue`
- **复杂度**: ⭐⭐
- **预计时间**: 1-2 天
- **优先级**: 🟢 低

#### 说明
- 导航视图，用于场景导航

#### 参考文件
- 原实现: `src/ui/NavigationView.ts`

---

## 🤖 Agent 4: 低优先级组件组 B

> 📄 **详细任务文档**: [AGENT_4_TASKS.md](./AGENT_4_TASKS.md)

### 任务 1: TopView
- **文件**: `src/ui/TopView.ts`
- **Vue 实现**: `src/vue-app/components/TopView.vue`
- **复杂度**: ⭐⭐⭐
- **预计时间**: 1-2 天
- **优先级**: 🟢 低

#### 说明
- 顶部视图包含菜单栏和工具栏
- 已有 TopMenuBar 和 TopToolBar，但 TopView 包含更多集成逻辑

#### 参考文件
- 原实现: `src/ui/TopView.ts`
- 相关组件: `src/vue-app/components/TopMenuBar.vue` ✅
- 相关组件: `src/vue-app/components/TopToolBar.vue` ✅

### 任务 2: ParticleEffectController
- **文件**: `src/ui/ParticleEffectController.ts`
- **Vue 实现**: `src/vue-app/components/ParticleEffectController.vue`
- **复杂度**: ⭐⭐
- **预计时间**: 1-2 天
- **优先级**: 🟢 低

#### 说明
- 粒子效果控制器，用于控制粒子系统的播放、暂停、速度等

#### 参考文件
- 原实现: `src/ui/ParticleEffectController.ts`

### 任务 3: HierarchyTreeItemRenderer（待确认）
- **文件**: `src/ui/hierarchy/HierarchyTreeItemRenderer.ts`
- **Vue 实现**: 可能已集成到 `HierarchyView.vue`
- **复杂度**: ⭐⭐⭐
- **预计时间**: 1-2 天（如果未集成）
- **优先级**: 🟢 低

#### 说明
- 层级树项渲染器，可能已集成到 HierarchyView.vue 中
- **需要先确认是否已实现**

#### 实现步骤
1. 检查 `HierarchyView.vue` 是否已实现树项渲染功能
2. 如果已实现，标记为"已集成，无需实现"
3. 如果未实现，实现 HierarchyTreeItemRenderer

---

## 🤖 Agent 5: 低优先级组件组 C（待确认类）

> 📄 **详细任务文档**: [AGENT_5_TASKS.md](./AGENT_5_TASKS.md)

### 任务 1: AssetFileItemRenderer（待确认）
- **文件**: `src/ui/assets/AssetFileItemRenderer.ts`
- **Vue 实现**: 可能已集成到 `ProjectView.vue`
- **复杂度**: ⭐⭐⭐
- **预计时间**: 1-2 天（如果未集成）
- **优先级**: 🟢 低

#### 说明
- 资源文件项渲染器，可能已集成到 ProjectView.vue 中
- **需要先确认是否已实现**

#### 实现步骤
1. 检查 `ProjectView.vue` 是否已实现文件项渲染功能
2. 如果已实现，标记为"已集成，无需实现"
3. 如果未实现，实现 AssetFileItemRenderer

### 任务 2: AssetTreeItemRenderer（待确认）
- **文件**: `src/ui/assets/AssetTreeItemRenderer.ts`
- **Vue 实现**: 可能已集成到 `ProjectView.vue`
- **复杂度**: ⭐⭐⭐
- **预计时间**: 1-2 天（如果未集成）
- **优先级**: 🟢 低

#### 说明
- 资源树项渲染器，可能已集成到 ProjectView.vue 中
- **需要先确认是否已实现**

#### 实现步骤
1. 检查 `ProjectView.vue` 是否已实现树项渲染功能
2. 如果已实现，标记为"已集成，无需实现"
3. 如果未实现，实现 AssetTreeItemRenderer

---

## 📝 实现检查清单

每个组件实现时需要检查：
- [ ] 功能完整性（与 Egret 版本功能一致）
- [ ] 样式适配（深色主题，使用 Element Plus CSS 变量）
- [ ] 事件处理（正确触发和监听）
- [ ] 响应式数据绑定
- [ ] 性能优化（避免不必要的重渲染）
- [ ] 类型定义（TypeScript 类型完整）
- [ ] 文档注释（JSDoc 注释）
- [ ] 适配器类（如果需要与 Egret 代码兼容）
- [ ] 无编译错误和 lint 错误
- [ ] 更新 `VUE_MIGRATION_PROGRESS.md` 文档

---

## 🎯 完成标准

### 每个 Agent 完成标准
1. 所有分配的任务已完成或已确认无需实现
2. 所有代码通过编译和 lint 检查
3. 已更新 `VUE_MIGRATION_PROGRESS.md` 文档
4. 已提交代码（如果适用）

### 整体完成标准
- 所有高优先级任务完成
- 所有中优先级任务完成或已评估
- 所有低优先级任务完成或已确认

---

## 📚 参考资源

- **迁移进度文档**: `docs/VUE_MIGRATION_PROGRESS.md`
- **Element Plus 使用指南**: `docs/ELEMENT_PLUS_USAGE.md`
- **自定义组件说明**: `docs/CUSTOM_COMPONENTS_REASON.md`
- **实现状态**: `src/vue-app/objectview/IMPLEMENTATION_STATUS.md`

---

## 🔄 更新日志

### 2024-12-19
- 📝 创建任务分配文档
- 📋 将 12 个待实现组件分配给 5 个 agent
- 🎯 明确每个 agent 的任务和优先级

---

**维护者**: 开发团队  
**更新频率**: 每个 agent 完成任务后更新
