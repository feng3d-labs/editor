# Element Plus 和 @iconify/vue 使用指南

## 📦 已安装的依赖

- ✅ **element-plus** - UI 组件库
- ✅ **@iconify/vue** - 图标库
- ✅ **unplugin-vue-components** - 按需引入插件
- ✅ **unplugin-auto-import** - 自动导入插件

## 🚀 配置说明

### 1. Vite 配置（已配置）

在 `vite.config.js` 中已配置按需引入：

```javascript
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

plugins: [
  AutoImport({
    resolvers: [ElementPlusResolver()],
  }),
  Components({
    resolvers: [ElementPlusResolver()],
  }),
]
```

**优势**：
- ✅ 自动按需引入，无需手动 import
- ✅ 减小打包体积
- ✅ TypeScript 支持

### 2. 样式配置（已配置）

在 `src/vue-app/main.ts` 中已引入样式：

```typescript
import 'element-plus/dist/index.css';
import './styles/element-plus-theme.css'; // 深色主题定制
```

深色主题已配置为与编辑器风格一致。

## 📖 使用方法

### Element Plus 组件

**无需手动导入，直接使用**：

```vue
<template>
  <el-button type="primary">按钮</el-button>
  <el-input v-model="value" placeholder="请输入" />
  <el-select v-model="selected">
    <el-option label="选项1" value="1" />
  </el-select>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// 无需导入 el-button、el-input 等组件
const value = ref('');
const selected = ref('');
</script>
```

**常用组件**：
- `el-button` - 按钮
- `el-input` - 输入框
- `el-select` - 选择器
- `el-checkbox` - 复选框
- `el-radio` - 单选框
- `el-switch` - 开关
- `el-slider` - 滑块
- `el-dialog` - 对话框
- `el-drawer` - 抽屉
- `el-message` - 消息提示
- `el-notification` - 通知
- `el-popover` - 弹出框
- `el-tooltip` - 工具提示
- `el-table` - 表格
- `el-tree` - 树形控件
- `el-menu` - 菜单
- 更多组件：https://element-plus.org/zh-CN/component/button.html

### @iconify/vue 图标

**方式 1：使用封装的 Icon 组件（推荐）**

```vue
<template>
  <Icon icon="mdi:home" :size="24" />
  <Icon icon="material-symbols:settings" :size="20" color="#007acc" />
</template>

<script setup lang="ts">
import Icon from '@/vue-app/components/Icon.vue';
</script>
```

**方式 2：直接使用 IconifyIcon**

```vue
<template>
  <IconifyIcon icon="mdi:home" />
</template>

<script setup lang="ts">
import { Icon as IconifyIcon } from '@iconify/vue';
</script>
```

**常用图标集**：

1. **Material Design Icons (mdi:)** - 最常用
   - `mdi:home` - 首页
   - `mdi:settings` - 设置
   - `mdi:close` - 关闭
   - `mdi:check` - 确认
   - `mdi:menu` - 菜单
   - 更多：https://icon-sets.iconify.design/mdi/

2. **Material Symbols (material-symbols:)**
   - `material-symbols:folder` - 文件夹
   - `material-symbols:file` - 文件
   - 更多：https://icon-sets.iconify.design/material-symbols/

3. **VS Code Icons (vscode-icons:)** - 编辑器专用
   - `vscode-icons:file-type-vue` - Vue 文件
   - `vscode-icons:file-type-js` - JS 文件
   - `vscode-icons:folder` - 文件夹
   - 更多：https://icon-sets.iconify.design/vscode-icons/

4. **搜索图标**：
   - 访问：https://icon-sets.iconify.design/
   - 搜索需要的图标
   - 复制图标名称（如 `mdi:home`）

## 🎨 主题定制

### 深色主题变量

在 `src/vue-app/styles/element-plus-theme.css` 中已定义：

```css
:root {
  --el-color-primary: #007acc; /* 主色调 */
  --el-bg-color: #1e1e1e; /* 背景色 */
  --el-text-color-primary: #cccccc; /* 文本颜色 */
  /* ... 更多变量 */
}
```

### 自定义主题

如需修改主题，编辑 `src/vue-app/styles/element-plus-theme.css` 文件。

## 📝 使用示例

完整示例请参考：`src/vue-app/examples/ElementPlusExample.vue`

### 按钮示例

```vue
<el-button>默认按钮</el-button>
<el-button type="primary">主要按钮</el-button>
<el-button type="success">成功按钮</el-button>
<el-button :icon="Search">搜索</el-button>
```

### 输入框示例

```vue
<el-input v-model="value" placeholder="请输入" />
<el-input v-model="value" clearable>
  <template #prefix>
    <Icon icon="mdi:magnify" />
  </template>
</el-input>
```

### 消息提示示例

```vue
<script setup lang="ts">
import { ElMessage } from 'element-plus';

function showSuccess() {
  ElMessage.success('操作成功！');
}
</script>
```

### 图标示例

```vue
<template>
  <!-- 基础使用 -->
  <Icon icon="mdi:home" />
  
  <!-- 自定义大小 -->
  <Icon icon="mdi:settings" :size="24" />
  
  <!-- 自定义颜色 -->
  <Icon icon="mdi:close" color="#ff4444" />
  
  <!-- 在按钮中使用 -->
  <el-button>
    <Icon icon="mdi:save" :size="16" />
    保存
  </el-button>
</template>
```

## 🔧 最佳实践

### 1. 按需引入

✅ **已自动配置**，无需手动 import 组件

```vue
<!-- 直接使用，无需 import -->
<el-button>按钮</el-button>
```

### 2. 图标使用

✅ **推荐使用封装的 Icon 组件**

```vue
<Icon icon="mdi:home" :size="24" />
```

### 3. 主题一致性

✅ **使用 CSS 变量保持主题一致**

```vue
<style scoped>
.custom-button {
  background-color: var(--el-bg-color-overlay);
  color: var(--el-text-color-primary);
}
</style>
```

### 4. TypeScript 支持

✅ **自动类型推导，无需额外配置**

```typescript
// 自动导入的类型
import { ElMessage } from 'element-plus';
```

## 📚 参考文档

- **Element Plus 文档**：https://element-plus.org/zh-CN/
- **Iconify 图标搜索**：https://icon-sets.iconify.design/
- **Element Plus 组件列表**：https://element-plus.org/zh-CN/component/button.html

## ⚠️ 注意事项

1. **按需引入**：已配置自动按需引入，无需手动 import
2. **样式覆盖**：如需覆盖 Element Plus 样式，使用 CSS 变量或深度选择器
3. **图标加载**：@iconify/vue 按需加载图标，首次使用可能需要网络请求
4. **主题一致性**：确保 Element Plus 组件与编辑器深色主题保持一致

## 🎯 下一步

1. ✅ 在现有组件中替换文本符号为图标
2. ✅ 使用 Element Plus 组件替换自研的基础组件（如需要）
3. ✅ 保持主题一致性，使用统一的 CSS 变量

