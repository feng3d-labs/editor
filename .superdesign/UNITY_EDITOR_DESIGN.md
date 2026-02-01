# Unity 风格网页编辑器设计规范

本文档定义 Unity 风格网页编辑器的完整设计规范，用于指导 Vue 项目实现。

## 设计概述

### 设计目标
创建一个专业的 Unity 风格网页编辑器界面，具有：
- 完整的编辑器布局（菜单栏、工具栏、面板）
- 暗色主题，符合 Unity 编辑器视觉风格
- 使用 Element Plus 组件库确保一致性
- 可调整大小的分割面板布局
- 响应式设计，适配不同屏幕尺寸

### 设计参考
- Unity Editor 官方界面
- Element Plus 设计系统
- 当前项目布局结构

## 布局结构

```
┌─────────────────────────────────────────────────────────┐
│ Header (48px) - Menu Bar                                 │
├─────────────────────────────────────────────────────────┤
│ Toolbar (48px) - Tools & Play Controls                  │
├──────────┬──────────────────────────────┬──────────────┤
│          │                              │              │
│          │                              │              │
│ Hierarchy│     Scene Viewport           │  Inspector  │
│ (256px)  │     (Flexible)               │  (320px)    │
│          │                              │              │
│          │                              │              │
│          ├──────────────────────────────┤              │
│          │ Console / Project            │              │
│          │ (192px)                      │              │
└──────────┴──────────────────────────────┴──────────────┘
```

## 组件设计规范

### 1. Header Navigation (顶部菜单栏)

**位置**: `src/vue-app/components/TopMenuBar.vue`

**Element Plus 组件**: `el-menu`, `el-menu-item`

**设计规范**:
- 高度: 48px (`h-12`)
- 背景色: `#1a1a1a` (header background)
- 边框: 底部 1px `#4c4d4f`
- 菜单项:
  - 高度: 48px
  - 内边距: `0 20px` (`px-5`)
  - 字体大小: 13px
  - 激活状态: 底部 2px 蓝色线条 (`#409EFF`)
  - 悬停效果: 背景色 `rgba(255,255,255,0.05)`

**菜单项**:
- File (文件)
- Edit (编辑)
- Assets (资源)
- GameObject (游戏对象)
- Component (组件)
- Window (窗口)

**项目名称**: 居中显示，字体大小 13px，字重 600

### 2. Toolbar (工具栏)

**位置**: `src/vue-app/components/TopToolBar.vue`

**Element Plus 组件**: `el-button-group`, `el-button`, `el-divider`

**设计规范**:
- 高度: 48px (`h-12`)
- 背景色: `#141414`
- 边框: 底部 1px `#4c4d4f`
- 内边距: `0 16px` (`px-4`)

**工具组**:
1. **变换工具** (左侧):
   - Move (移动) - `el-button-group`
   - Rotate (旋转)
   - Scale (缩放)
   - 按钮尺寸: `w-10 h-8` (40px × 32px)
   - 激活状态: 主色背景

2. **播放控制** (中间):
   - Play (播放) - `el-button` type="primary"
   - Pause (暂停)
   - Step (步进)
   - 容器: 圆角背景 `#262727`

3. **辅助工具** (右侧):
   - Search (搜索) - `el-input` with icon
   - Help (帮助)
   - Settings (设置)

### 3. Left Sidebar - Hierarchy (左侧层级面板)

**位置**: `src/vue-app/views/HierarchyView.vue`

**Element Plus 组件**: `el-tree`

**设计规范**:
- 宽度: 256px (`w-64`)
- 背景色: `#1d1e1f` (panel background)
- 边框: 右侧 1px `#4c4d4f`

**面板头部**:
- 高度: 40px (`h-10`)
- 内边距: `0 16px` (`px-4`)
- 标题: "Hierarchy"
- 添加按钮: 右侧图标按钮

**树形结构**:
- 节点高度: 24px
- 内边距: `8px 8px` (`p-2`)
- 图标大小: 16px
- 激活状态: 背景色 `rgba(64, 158, 255, 0.1)`，文字颜色 `#409EFF`
- 悬停效果: 背景色 `#2b2c2d`

### 4. Center Content - Scene Viewport (中间场景视口)

**位置**: `src/vue-app/views/SceneView.vue`

**Element Plus 组件**: `el-tabs`, `el-tab-pane`

**设计规范**:
- 背景色: `#141414`
- 标签页高度: 40px (`h-10`)
- 标签页背景: `#1d1e1f`

**标签页**:
- Scene (场景) - 默认激活
- Game (游戏)
- Asset Store (资源商店) - 可选

**视口区域**:
- 背景: 深黑色 `#0a0a0a`
- 网格图案: 40px × 40px，颜色 `rgba(64, 158, 255, 0.05)`
- 3D 场景渲染区域

**底部统计信息** (可选):
- 位置: 右下角
- 背景: `rgba(43, 44, 45, 0.8)` with backdrop blur
- 字体: 等宽字体，10px
- 内容: FPS, Batches, Triangles

### 5. Bottom Panel - Console (底部控制台面板)

**位置**: `src/vue-app/views/ConsoleView.vue`

**Element Plus 组件**: `el-tabs`, `el-tab-pane`

**设计规范**:
- 高度: 192px (`h-48`)
- 背景色: `#1d1e1f`
- 边框: 顶部 1px `#4c4d4f`

**标签页**:
- Console (控制台) - 默认激活
- Project (项目)
- Timeline (时间轴) - 可选

**控制台头部**:
- 高度: 40px
- Clear 按钮: 右侧
- 日志统计: Info, Warning, Error 计数

**日志列表**:
- 字体: 等宽字体，12px
- 行高: 紧凑
- 日志级别颜色:
  - Info: `#409EFF`
  - Warning: `#E6A23C`
  - Error: `#F56C6C`

### 6. Right Sidebar - Inspector (右侧检查器面板)

**位置**: `src/vue-app/views/InspectorView.vue`

**Element Plus 组件**: `el-form`, `el-form-item`, `el-input`, `el-select`, `el-button`

**设计规范**:
- 宽度: 320px (`w-80`)
- 背景色: `#1d1e1f`
- 边框: 左侧 1px `#4c4d4f`

**面板头部**:
- 高度: 40px
- 标题: "Inspector"
- 设置按钮: 右侧图标

**内容区域**:
- 内边距: `16px` (`p-4`)
- 滚动: 垂直滚动

**对象头部**:
- 名称输入: `el-input`，背景 `#262727`
- Tag/Layer 选择: `el-select`，网格布局 2 列

**组件属性**:
- 折叠面板: 使用 Accordion 组件
- 表单布局: `el-form-item`
- 输入控件:
  - 文本: `el-input`
  - 数字: `el-input` type="number"
  - 选择: `el-select`
  - 滑块: `el-slider`
  - 开关: `el-switch`
  - 颜色: `el-color-picker`

**Add Component 按钮**:
- 位置: 底部
- 类型: `el-button` type="primary"
- 宽度: 100%
- 高度: 36px (`h-9`)

## 颜色系统

### 主色调
- **背景色**: `#141414` (主背景)
- **面板背景**: `#1d1e1f` (面板背景)
- **头部背景**: `#1a1a1a` (菜单栏/工具栏背景)
- **输入背景**: `#262727` (输入框背景)
- **悬停背景**: `#2b2c2d` (悬停状态)

### 强调色
- **主色**: `#409EFF` (Element Plus 默认蓝色)
- **成功**: `#67C23A`
- **警告**: `#E6A23C`
- **危险**: `#F56C6C`
- **信息**: `#909399`

### 边框和文本
- **边框色**: `#4c4d4f`
- **主文本**: `#cfd3dc`
- **次要文本**: `rgba(207, 211, 220, 0.6)`

## 间距系统

基于 8px 网格系统:
- 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

**常用间距**:
- 组件内边距: 8px, 12px, 16px
- 组件间距: 8px, 12px, 16px
- 面板内边距: 16px (`p-4`)

## 字体系统

### 字体族
- 主字体: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`
- 等宽字体: `'JetBrains Mono', 'Consolas', monospace` (用于代码和控制台)

### 字号
- 菜单栏: 13px
- 工具栏: 13px
- 面板标题: 14px, 字重 500
- 内容文本: 12px, 14px
- 控制台日志: 12px
- 统计信息: 10px

### 字重
- 正常: 400
- 中等: 500
- 半粗: 600

## Element Plus 组件使用

### 已使用的组件
- `el-menu` / `el-menu-item` - 菜单栏
- `el-button` / `el-button-group` - 工具栏按钮
- `el-divider` - 分隔线
- `el-tabs` / `el-tab-pane` - 标签页
- `el-tree` - 层级树
- `el-form` / `el-form-item` - 表单
- `el-input` - 文本输入
- `el-select` / `el-option` - 下拉选择
- `el-slider` - 滑块
- `el-switch` - 开关
- `el-color-picker` - 颜色选择器
- `el-icon` - 图标

### 需要使用的组件
- `el-scrollbar` - 自定义滚动条
- `el-collapse` / `el-collapse-item` - 折叠面板
- `el-breadcrumb` - 面包屑导航
- `el-dropdown` - 下拉菜单

## 交互设计

### 面板调整
- 使用 `SplitPanel` 组件实现可调整大小的分割
- 分割条宽度: 4px
- 分割条颜色: `#4c4d4f`
- 悬停效果: 高亮显示

### 标签页
- 支持拖拽排序
- 支持关闭（至少保留一个）
- 支持添加新标签页
- 激活状态: 底部 2px 蓝色线条

### 树形结构
- 支持拖拽排序
- 支持展开/折叠
- 支持多选（Ctrl/Cmd + Click）
- 支持右键菜单

### 表单输入
- 聚焦状态: 边框颜色 `#409EFF`，阴影效果
- 验证状态: 使用 Element Plus 内置验证
- 禁用状态: 透明度 0.5

## 响应式设计

### 断点
- 小屏幕 (< 1024px): 隐藏部分面板，使用抽屉式菜单
- 中等屏幕 (1024px - 1440px): 标准布局
- 大屏幕 (> 1440px): 优化间距和字体大小

### 面板最小宽度
- Hierarchy: 150px
- Inspector: 200px
- Console: 100px (高度)

## 实现检查清单

### 布局
- [ ] 顶部菜单栏 (48px)
- [ ] 工具栏 (48px)
- [ ] 左侧层级面板 (256px)
- [ ] 中间场景视口 (flexible)
- [ ] 底部控制台面板 (192px)
- [ ] 右侧检查器面板 (320px)

### 组件
- [ ] 所有组件使用 Element Plus
- [ ] 应用设计令牌中的颜色
- [ ] 应用设计令牌中的间距
- [ ] 应用设计令牌中的字体

### 主题
- [ ] 支持暗色主题
- [ ] 支持亮色主题（可选）
- [ ] 使用 Element Plus CSS 变量

### 交互
- [ ] 面板可调整大小
- [ ] 标签页可拖拽排序
- [ ] 树形结构支持拖拽
- [ ] 表单输入验证

## 参考资源

- **Unity Editor**: https://unity.com/
- **Element Plus**: https://element-plus.org/
- **当前项目**: `src/vue-app/`
- **设计令牌**: `src/vue-app/configs/designTokens.ts`

## 下一步

1. 根据此设计规范更新现有组件
2. 实现缺失的组件
3. 应用设计令牌
4. 测试和验证
