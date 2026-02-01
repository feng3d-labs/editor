# Egret 到 Vue 迁移计划

本文档列出所有需要从 Egret 迁移到 Vue 的界面组件，并提供实现计划。

## 📊 迁移进度总览

- **已实现**: 26 个主要视图/组件（新增 7 个第二阶段组件）
- **待实现**: 约 12 个组件
- **进度**: 约 68% 完成

## ✅ 已实现的 Vue 组件

### 主要视图（Views）
- ✅ **ProjectView.vue** - 项目资源视图
- ✅ **InspectorView.vue** - 属性检查器视图
- ✅ **SceneView.vue** - 场景视图
- ✅ **HierarchyView.vue** - 层级视图
- ✅ **ConsoleView.vue** - 控制台视图

### UI 组件（Components）
- ✅ **CameraPreview.vue** - 相机预览
- ✅ **Menu.vue** + **MenuAdapter.ts** - 菜单组件
- ✅ **Message.vue** + **MessageAdapter.ts** - 消息提示组件
- ✅ **ToolTip.vue** + **ToolTipAdapter.ts** - 工具提示组件
- ✅ **TabPanel.vue** - 标签页面板
- ✅ **SplitPanel.vue** - 分割面板
- ✅ **TopMenuBar.vue** - 顶部菜单栏
- ✅ **TopToolBar.vue** - 顶部工具栏
- ✅ **PopupView.ts** + **PopupViewAdapter.ts** - 弹出视图管理器
- ✅ **WindowView.vue** - 窗口视图组件
- ✅ **MaskView.vue** - 遮罩层组件
- ✅ **ComboBox.vue** - 下拉选择框
- ✅ **RenameTextInput.vue** - 可编辑重命名输入
- ✅ **Accordion.vue** - 手风琴折叠组件
- ✅ **ComponentView.vue** - 组件视图
- ✅ **ParticleComponentView.vue** - 粒子组件视图
- ✅ **MinMaxCurveView.vue** - 最小最大曲线视图
- ✅ **MinMaxCurveVector3View.vue** - 最小最大曲线向量3视图
- ✅ **MinMaxGradientView.vue** - 最小最大渐变视图

### ObjectView 组件（已实现 20 个）
- ✅ OVDefault, OVBaseDefault, OVFolderAsset
- ✅ OBVDefault
- ✅ OAVDefault, OAVBoolean, OAVNumber, OAVString, OAVEnum
- ✅ OAVVector2, OAVVector3, OAVVector4
- ✅ OAVArray, OAVObjectView, OAVMultiText
- ✅ OAVImage, OAVTexture2D, OAVCubeMap
- ✅ OAVColorPicker, OAVMaterialName, OAVGameObjectName
- ✅ OAVFunction, OAVPick, OAVAccordionObjectView

## ⏳ 待实现的组件（按优先级排序）

### 🔴 高优先级 - 核心 UI 组件（影响主要功能）

#### ✅ 1. **Popupview.ts** → `PopupView.ts` + `PopupViewAdapter.ts` ✅
- **状态**: 已完成
- **说明**: 弹出视图管理器，支持 Vue 和 Egret 组件

#### ✅ 2. **WindowView.ts** → `WindowView.vue` ✅
- **状态**: 已完成
- **说明**: 可拖拽、可调整大小的窗口组件

#### ✅ 3. **Maskview.ts** → `MaskView.vue` ✅
- **状态**: 已完成
- **说明**: 遮罩层组件，用于弹出窗口

#### ✅ 4. **ComboBox.ts** → `ComboBox.vue` ✅
- **状态**: 已完成
- **说明**: 使用 Element Plus 的 el-select 实现

#### ✅ 5. **RenameTextInput.ts** → `RenameTextInput.vue` ✅
- **状态**: 已完成
- **说明**: 双击编辑的重命名输入组件

#### ✅ 6. **Accordion.ts** → `Accordion.vue` ✅
- **状态**: 已完成
- **说明**: 手风琴折叠组件

### 🟡 中优先级 - 编辑器组件（影响特定功能）

#### ✅ 6. **ComponentView.ts** → `ComponentView.vue` ✅
- **状态**: 已完成
- **说明**: 组件视图，支持 enabled 开关、操作菜单、脚本实例视图

#### ✅ 7. **ParticleComponentView.ts** → `ParticleComponentView.vue` ✅
- **状态**: 已完成
- **说明**: 粒子组件视图

#### ✅ 8. **MinMaxCurveView.ts** → `MinMaxCurveView.vue` ✅
- **状态**: 已完成
- **说明**: 支持常量、两个常量、曲线、两条曲线模式，使用 Canvas 绘制

#### ✅ 9. **MinMaxCurveVector3View.ts** → `MinMaxCurveVector3View.vue` ✅
- **状态**: 已完成
- **说明**: 包含 X、Y、Z 三个 MinMaxCurveView

#### ✅ 10. **MinMaxGradientView.ts** → `MinMaxGradientView.vue` ✅
- **状态**: 已完成
- **说明**: 支持颜色、渐变、两个颜色、两个渐变、随机颜色模式

#### 11. **GradientEditor.ts** → `GradientEditor.vue`
- **用途**: 渐变编辑器
- **依赖**: 无
- **复杂度**: ⭐⭐⭐
- **预计时间**: 2-3 天
- **说明**: 用于编辑颜色渐变

#### 12. **MinMaxCurveEditor.ts** → `MinMaxCurveEditor.vue`
- **用途**: 最小最大曲线编辑器
- **依赖**: MinMaxCurveView
- **复杂度**: ⭐⭐⭐⭐
- **预计时间**: 3-4 天
- **说明**: 曲线编辑界面

### 🟢 低优先级 - 辅助组件（可选功能）

#### 13. **TabView.ts** → `TabView.vue`
- **用途**: 标签页视图（已有 TabPanel.vue，可能需要统一）
- **依赖**: 无
- **复杂度**: ⭐⭐
- **预计时间**: 1-2 天
- **说明**: 检查是否与 TabPanel 功能重复

#### 14. **SplitGroup.ts / SplitUIComponent.ts** → `SplitGroup.vue`
- **用途**: 分割组组件
- **依赖**: 无
- **复杂度**: ⭐⭐
- **预计时间**: 1-2 天
- **说明**: 已有 SplitPanel，可能需要统一

#### 15. **TreeItemRenderer.ts / TreeNode.ts** → `TreeItemRenderer.vue`
- **用途**: 树节点渲染器
- **依赖**: 无
- **复杂度**: ⭐⭐
- **预计时间**: 1-2 天
- **说明**: 如果使用 Element Plus 的 el-tree，可能不需要

#### 16. **AreaSelectRect.ts** → `AreaSelectRect.vue`
- **用途**: 区域选择矩形
- **依赖**: 无
- **复杂度**: ⭐⭐⭐
- **预计时间**: 2 天
- **说明**: 用于场景视图中的区域选择

#### 17. **Maskview.ts** → `MaskView.vue`
- **用途**: 遮罩视图
- **依赖**: 无
- **复杂度**: ⭐
- **预计时间**: 0.5 天
- **说明**: 简单的遮罩层，用于 Popupview

#### 18. **TipString.ts** → `TipString.vue`
- **用途**: 提示字符串组件
- **依赖**: 无
- **复杂度**: ⭐
- **预计时间**: 0.5 天
- **说明**: 简单的提示组件

#### 19. **TerrainView.ts** → `TerrainView.vue`
- **用途**: 地形视图
- **依赖**: ObjectView
- **复杂度**: ⭐⭐⭐
- **预计时间**: 2-3 天
- **说明**: 地形编辑功能

### 🔵 视图类（Views）

#### 20. **AnimationView.ts** → `AnimationView.vue`
- **用途**: 动画视图
- **依赖**: TabView
- **复杂度**: ⭐⭐⭐
- **预计时间**: 2-3 天
- **说明**: 动画编辑界面

#### 21. **MainView.ts** → `MainView.vue`
- **用途**: 主视图
- **依赖**: 多个子视图
- **复杂度**: ⭐⭐⭐
- **预计时间**: 2-3 天
- **说明**: 主界面布局

#### 22. **MainSplitView.ts** → `MainSplitView.vue`
- **用途**: 主分割视图
- **依赖**: SplitGroup
- **复杂度**: ⭐⭐
- **预计时间**: 1-2 天
- **说明**: 主界面的分割布局

#### 23. **ParticleEffectController.ts** → `ParticleEffectController.vue`
- **用途**: 粒子效果控制器
- **依赖**: ParticleComponentView
- **复杂度**: ⭐⭐⭐
- **预计时间**: 2-3 天
- **说明**: 粒子效果控制界面

#### 24. **NavigationView.ts** → `NavigationView.vue`
- **用途**: 导航视图
- **依赖**: 无
- **复杂度**: ⭐⭐
- **预计时间**: 1-2 天
- **说明**: 导航栏界面

#### 25. **TopView.ts** → `TopView.vue`
- **用途**: 顶部视图
- **依赖**: TopMenuBar, TopToolBar
- **复杂度**: ⭐
- **预计时间**: 0.5 天
- **说明**: 顶部区域容器

#### 26. **ShortCutSetting.ts** → `ShortCutSetting.vue`
- **用途**: 快捷键设置
- **依赖**: Popupview
- **复杂度**: ⭐⭐⭐
- **预计时间**: 2-3 天
- **说明**: 快捷键配置界面

## 📋 实现计划（建议顺序）

### 第一阶段：核心 UI 组件（1-2 周）
1. PopupView.vue + WindowView.vue + MaskView.vue
2. ComboBox.vue
3. RenameTextInput.vue
4. Accordion.vue

### 第二阶段：编辑器组件（2-3 周）
5. ComponentView.vue
6. ParticleComponentView.vue
7. MinMaxCurveView.vue
8. MinMaxCurveVector3View.vue
9. MinMaxGradientView.vue
10. GradientEditor.vue
11. MinMaxCurveEditor.vue

### 第三阶段：辅助组件和视图（1-2 周）
12. TabView.vue（如果需要）
13. SplitGroup.vue（如果需要）
14. TreeItemRenderer.vue（如果需要）
15. AreaSelectRect.vue
16. TipString.vue
17. TerrainView.vue

### 第四阶段：视图类（1-2 周）
18. AnimationView.vue
19. MainView.vue
20. MainSplitView.vue
21. ParticleEffectController.vue
22. NavigationView.vue
23. TopView.vue
24. ShortCutSetting.vue

## 🛠️ 实现建议

### 技术选型
- **UI 框架**: Element Plus（已有基础）
- **状态管理**: Pinia（已配置）
- **Canvas 绘制**: 使用原生 Canvas API 或考虑使用 Konva.js
- **事件系统**: 继续使用 globalEmitter

### 实现模式
1. **简单组件**: 直接使用 Element Plus 组件（如 ComboBox → el-select）
2. **复杂组件**: 创建 Vue 组件，功能逻辑写在 `<script setup>` 中
3. **Canvas 组件**: 使用 Vue 的 ref 和 onMounted 管理 Canvas 实例
4. **适配器模式**: 对于需要与 Egret 代码兼容的组件，创建适配器类

### 注意事项
1. **向后兼容**: 创建适配器类，确保现有代码可以继续使用
2. **样式统一**: 使用 Element Plus 主题变量，保持深色主题
3. **性能优化**: 对于频繁更新的组件（如曲线视图），注意性能优化
4. **测试**: 每个组件实现后，在 InspectorView 或相关视图中测试

## 📝 实现检查清单

对于每个组件，需要检查：
- [ ] 功能完整性（与 Egret 版本功能一致）
- [ ] 样式适配（深色主题）
- [ ] 事件处理（正确触发和监听）
- [ ] 响应式数据绑定
- [ ] 性能优化（避免不必要的重渲染）
- [ ] 类型定义（TypeScript 类型完整）
- [ ] 文档注释（JSDoc 注释）
- [ ] 适配器类（如果需要）

## 🎯 完成标准

- 所有高优先级组件实现完成
- 所有中优先级组件实现完成
- 主要视图类实现完成
- 无编译错误和 lint 错误
- 功能测试通过

---

**最后更新**: 2024-12-19
**维护者**: 开发团队
