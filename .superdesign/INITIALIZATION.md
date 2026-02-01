# SuperDesign 设计环境初始化指南

本文档说明如何在 feng3d-editor 项目中初始化和使用 SuperDesign 设计环境。

## 前置条件

1. 已安装 Cursor IDE
2. 项目已配置好 Vue 3 + Element Plus 环境

## 初始化步骤

### 1. 安装 SuperDesign 扩展

1. 打开 Cursor IDE
2. 按 `Ctrl + Shift + X` (Windows) 或 `Cmd + Shift + X` (Mac) 打开扩展市场
3. 搜索 "SuperDesign"
4. 点击安装按钮

### 2. 初始化 SuperDesign

1. 按 `Ctrl + Shift + P` (Windows) 或 `Cmd + Shift + P` (Mac) 打开命令面板
2. 输入并执行命令：`superdesign: initialize`
3. 等待初始化完成

### 3. 验证安装

1. 执行命令：`superdesign: open canva` 打开设计画布
2. 确认扩展正常工作

## 项目配置说明

项目已预配置 SuperDesign 环境，配置文件位于 `.superdesign/config.json`，包含以下信息：

- **项目名称**: feng3d-editor
- **UI 框架**: Vue 3
- **组件库**: Element Plus
- **主题**: 支持暗色和亮色主题
- **设计令牌**: 颜色、间距、字体系统

## 使用 SuperDesign 设计界面

### 基本流程

1. **打开设计画布**
   - 执行命令：`superdesign: open canva`

2. **描述设计需求**
   - 使用自然语言描述 UI 需求
   - 例如：
     - "设计一个深色主题的导航栏，包含项目名称和菜单项"
     - "创建一个包含工具栏的主布局，左侧是属性面板，右侧是场景视图"
     - "设计一个属性编辑器组件，支持颜色选择器和数值输入"

3. **生成设计**
   - 执行命令：`superdesign: generate`
   - 或直接在画布中使用生成功能

4. **预览和选择**
   - 在画布中预览生成的设计方案
   - 选择最符合需求的设计

5. **调整细节**
   - 在画布中调整设计细节
   - 修改颜色、间距、字体等

6. **导出代码**
   - 执行命令：`superdesign: export`
   - 代码会自动导出到项目对应目录

### 设计建议

1. **遵循设计系统**
   - 使用配置文件中定义的设计令牌
   - 保持与现有 UI 风格一致

2. **组件化设计**
   - 将复杂界面拆分为可复用的组件
   - 遵循 Vue 3 组件设计模式

3. **主题适配**
   - 确保设计同时支持暗色和亮色主题
   - 使用 Element Plus 的主题变量

4. **响应式设计**
   - 考虑不同屏幕尺寸的适配
   - 使用 Element Plus 的布局组件

## 目录结构

```
.superdesign/
├── config.json          # SuperDesign 配置文件
├── README.md            # 使用说明
├── INITIALIZATION.md    # 初始化指南（本文件）
├── designs/             # 设计文件（由 SuperDesign 自动生成）
│   └── .gitkeep
├── components/          # 导出的组件代码
│   └── .gitkeep
└── assets/              # 设计资源（图片、图标等）
    └── .gitkeep
```

## 常见问题

### Q: SuperDesign 扩展无法安装？

A: 确保 Cursor IDE 已更新到最新版本，SuperDesign 需要支持扩展的 Cursor 版本。

### Q: 初始化失败？

A: 检查项目目录权限，确保可以创建 `.superdesign` 目录和文件。

### Q: 导出的代码不符合项目规范？

A: 导出的代码需要手动调整以符合项目规范。可以参考 `.cursorrules` 中的代码规范。

### Q: 如何自定义设计令牌？

A: 编辑 `.superdesign/config.json` 文件中的 `designTokens` 部分。

## 相关资源

- SuperDesign 官网: https://app.superdesign.dev/
- Vue 3 文档: https://vuejs.org/
- Element Plus 文档: https://element-plus.org/

## 下一步

初始化完成后，你可以：
1. 打开设计画布开始设计
2. 查看 `.superdesign/README.md` 了解详细使用方法
3. 参考项目现有组件了解代码风格
