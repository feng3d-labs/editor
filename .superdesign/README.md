# SuperDesign 设计环境

本目录用于存储 SuperDesign 生成的设计文件和配置。

## 目录结构

```
.superdesign/
├── config.json          # SuperDesign 配置文件
├── designs/             # 设计文件（由 SuperDesign 自动生成）
├── components/          # 导出的组件代码
└── assets/              # 设计资源（图片、图标等）
```

## 使用方法

### 1. 在 Cursor 中安装 SuperDesign 扩展

1. 打开 Cursor
2. 按 `Cmd + Shift + X` (Mac) 或 `Ctrl + Shift + X` (Windows) 打开扩展市场
3. 搜索 "SuperDesign"
4. 点击安装

### 2. 初始化 SuperDesign

1. 按 `Cmd + Shift + P` (Mac) 或 `Ctrl + Shift + P` (Windows) 打开命令面板
2. 输入并执行：`superdesign: initialize`
3. 初始化会自动配置设计环境

### 3. 开始设计

1. 打开设计画布：执行命令 `superdesign: open canva`
2. 使用自然语言描述 UI 需求，例如：
   - "设计一个深色主题的导航栏"
   - "创建一个包含工具栏的主布局"
   - "设计一个属性面板组件"
3. 执行命令 `superdesign: generate` 生成设计
4. 在画布中预览和选择设计方案
5. 调整细节后导出代码到项目目录

## 项目配置

当前项目使用以下技术栈：
- **UI 框架**: Vue 3
- **组件库**: Element Plus
- **主题**: 支持暗色和亮色主题
- **样式**: CSS + Element Plus 主题定制

## 设计规范

### 颜色系统
- 主色：`#409EFF` (Element Plus 默认蓝色)
- 成功：`#67C23A`
- 警告：`#E6A23C`
- 危险：`#F56C6C`
- 信息：`#909399`

### 间距系统
- 基础单位：8px
- 间距比例：4, 8, 12, 16, 24, 32, 48, 64

### 字体系统
- 字体族：系统默认字体栈
- 字号：12, 14, 16, 18, 20, 24, 28, 32

## 导出位置

SuperDesign 生成的组件代码会自动导出到：
- 组件：`src/vue-app/components/`
- 布局：`src/vue-app/layouts/`
- 视图：`src/vue-app/views/`
- 样式：`src/vue-app/styles/`

## 注意事项

1. 导出的组件需要遵循项目的代码规范
2. 确保导出的组件与现有组件库（Element Plus）兼容
3. 样式需要适配项目的主题系统（暗色/亮色）
4. 导出的代码需要经过代码审查和测试
