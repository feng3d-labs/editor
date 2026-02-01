# Unity 风格编辑器实现计划

基于设计稿 `unity_web_editor_1.html` 的实现计划。

## 设计文件

- **设计稿**: `.superdesign/design_iterations/unity_web_editor_1.html`
- **设计规范**: `.superdesign/UNITY_EDITOR_DESIGN.md`

## 实现步骤

### 阶段一：基础布局（已完成 ✅）

- [x] TopView 组件（菜单栏 + 工具栏）
- [x] MainLayout 主布局结构
- [x] 基础样式和主题

### 阶段二：组件完善

#### 1. TopMenuBar（顶部菜单栏）

**当前状态**: 已使用 `el-menu`，需要完善样式

**需要更新**:
- [ ] 添加 Unity 图标和项目名称
- [ ] 完善菜单项样式（激活状态底部线条）
- [ ] 添加右侧工具（主题切换、设置）

**实现方式**:
```
"根据设计稿 unity_web_editor_1.html，完善 TopMenuBar 组件：
- 添加左侧 Unity 图标和项目名称
- 激活状态添加底部 2px 蓝色线条
- 添加右侧主题切换和设置按钮"
```

#### 2. TopToolBar（工具栏）

**当前状态**: 已使用 `el-button-group`，需要完善布局

**需要更新**:
- [ ] 调整工具组布局（左侧、中间、右侧）
- [ ] 完善播放控制按钮样式
- [ ] 添加搜索框

**实现方式**:
```
"根据设计稿更新 TopToolBar 组件：
- 左侧：变换工具组（移动、旋转、缩放）+ Pivot/Center、Local/World
- 中间：播放控制按钮组（播放、暂停、步进）
- 右侧：搜索框 + 帮助 + 设置按钮"
```

#### 3. HierarchyView（层级面板）

**当前状态**: 已使用 `el-tree`，需要完善样式

**需要更新**:
- [ ] 添加面板头部（标题 + 添加按钮）
- [ ] 完善树节点样式（图标、激活状态）
- [ ] 应用设计稿中的颜色和间距

**实现方式**:
```
"根据设计稿更新 HierarchyView 组件：
- 添加面板头部（高度 40px，标题 + 添加按钮）
- 树节点使用设计稿中的样式（激活状态、悬停效果）
- 应用设计令牌中的颜色和间距"
```

#### 4. SceneView（场景视口）

**当前状态**: 已有基础结构，需要完善 UI

**需要更新**:
- [ ] 添加标签页（Scene, Game）
- [ ] 添加网格背景图案
- [ ] 添加底部统计信息面板

**实现方式**:
```
"根据设计稿更新 SceneView 组件：
- 添加标签页头部（使用 el-tabs）
- 添加网格背景图案（40px × 40px，半透明蓝色）
- 添加右下角统计信息面板（FPS, Batches, Triangles）"
```

#### 5. ConsoleView（控制台面板）

**当前状态**: 需要完善实现

**需要更新**:
- [ ] 添加标签页（Console, Project）
- [ ] 实现日志列表（不同级别的颜色）
- [ ] 添加清除按钮和统计信息

**实现方式**:
```
"根据设计稿实现 ConsoleView 组件：
- 使用 el-tabs 显示 Console 和 Project 标签页
- 日志列表使用等宽字体，不同级别不同颜色
- 添加清除按钮和日志统计（Info, Warning, Error）"
```

#### 6. InspectorView（检查器面板）

**当前状态**: 已有基础结构，需要完善表单

**需要更新**:
- [ ] 完善对象头部（名称输入、Tag/Layer 选择）
- [ ] 实现组件属性编辑器（使用 el-form）
- [ ] 添加"添加组件"按钮

**实现方式**:
```
"根据设计稿更新 InspectorView 组件：
- 对象头部使用 el-input 和 el-select
- 组件属性使用 el-form 和 el-form-item
- 添加底部的"添加组件"按钮（el-button primary）"
```

### 阶段三：样式和主题

#### 1. 全局样式

- [ ] 更新滚动条样式（6px 宽度）
- [ ] 应用设计稿中的颜色系统
- [ ] 应用设计稿中的间距系统
- [ ] 应用设计稿中的字体系统

#### 2. 主题系统

- [ ] 确保所有组件支持暗色主题
- [ ] 使用 Element Plus CSS 变量
- [ ] 测试主题切换功能

### 阶段四：交互功能

#### 1. 面板调整

- [ ] 确保 SplitPanel 可调整大小
- [ ] 添加分割条样式
- [ ] 保存布局状态

#### 2. 标签页

- [ ] 支持拖拽排序
- [ ] 支持关闭标签
- [ ] 支持添加新标签

#### 3. 树形结构

- [ ] 支持拖拽排序
- [ ] 支持展开/折叠
- [ ] 支持多选

## 快速实现命令

### 在 Cursor 中使用

**更新单个组件**:
```
"根据设计稿 .superdesign/design_iterations/unity_web_editor_1.html 更新 [组件名] 组件"
```

**批量更新**:
```
"分析设计稿 unity_web_editor_1.html，更新所有需要改进的组件以符合设计稿"
```

**实现新组件**:
```
"根据设计稿实现 ConsoleView 组件，使用 Element Plus 组件"
```

## 设计稿查看

在浏览器中打开设计稿查看完整效果：
- 文件路径: `.superdesign/design_iterations/unity_web_editor_1.html`
- 或使用 VS Code 的 Live Server 扩展预览

## 设计规范参考

详细设计规范请参考：
- `.superdesign/UNITY_EDITOR_DESIGN.md` - 完整设计规范
- `.superdesign/design_iterations/unity_web_editor_1.html` - 设计稿 HTML

## 下一步

1. 在浏览器中打开设计稿查看效果
2. 告诉 Cursor 更新需要改进的组件
3. 逐步完善所有组件
4. 测试和验证
