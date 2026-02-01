# SuperDesign 设计应用指南

本文档说明如何将 SuperDesign 生成的设计应用到 feng3d-editor 项目中。

## 设计系统配置

项目已配置以下设计系统参数（来自 `.superdesign/config.json`）：

### 颜色系统
- **主色**: `#409EFF` (Element Plus 默认蓝色)
- **成功**: `#67C23A`
- **警告**: `#E6A23C`
- **危险**: `#F56C6C`
- **信息**: `#909399`

### 间距系统
- **基础单位**: 8px
- **间距比例**: 4, 8, 12, 16, 24, 32, 48, 64

### 字体系统
- **字体族**: 系统默认字体栈
- **字号**: 12, 14, 16, 18, 20, 24, 28, 32

## 已应用的设计改进

### 1. 设计令牌系统
已创建 `src/vue-app/configs/designTokens.ts`，提供：
- 颜色令牌常量
- 间距令牌工具函数
- 字体大小令牌工具函数

### 2. 主题样式更新
已更新 `src/vue-app/styles/global-dark-theme.css` 和 `global-light-theme.css`：
- 使用设计令牌中的主色 `#409EFF` 替代硬编码颜色
- 统一链接、选择文本、焦点状态的样式

## 如何在组件中使用设计令牌

### 导入设计令牌

```typescript
import { colorTokens, spacingTokens, typographyTokens, getSpacing, getFontSize } from '../configs/designTokens';
```

### 使用颜色令牌

```vue
<style scoped>
.my-component {
  color: v-bind('colorTokens.primary');
  background-color: v-bind('colorTokens.success');
}
</style>
```

或者使用 CSS 变量（推荐）：

```vue
<style scoped>
.my-component {
  color: var(--el-color-primary); /* Element Plus 已集成设计令牌 */
  background-color: var(--el-color-success);
}
</style>
```

### 使用间距令牌

```vue
<template>
  <div :style="{ padding: `${getSpacing(2)}px` }">
    <!-- 使用间距索引 2 = 12px -->
  </div>
</template>

<script setup lang="ts">
import { getSpacing } from '../configs/designTokens';
</script>
```

或者使用 CSS：

```vue
<style scoped>
.my-component {
  padding: 12px; /* 间距索引 2 */
  margin: 16px; /* 间距索引 3 */
  gap: 8px; /* 间距索引 1 */
}
</style>
```

### 使用字体大小令牌

```vue
<style scoped>
.my-component {
  font-size: 14px; /* 字体大小索引 1 */
  font-family: v-bind('typographyTokens.fontFamily');
}
</style>
```

## 与 Element Plus 集成

项目使用 Element Plus 组件库，Element Plus 的主题系统已自动应用设计令牌：

- `--el-color-primary`: `#409EFF`
- `--el-color-success`: `#67C23A`
- `--el-color-warning`: `#E6A23C`
- `--el-color-danger`: `#F56C6C`
- `--el-color-info`: `#909399`

在组件中直接使用 Element Plus 的 CSS 变量即可：

```vue
<style scoped>
.my-button {
  background-color: var(--el-color-primary);
  color: var(--el-color-primary-light-9);
}
</style>
```

## 从 SuperDesign 导出设计

### 1. 获取设计内容

```bash
superdesign get-design --draft-id <draft-id> --json
```

### 2. 转换为 Vue 组件

将 HTML 设计转换为 Vue 组件时，注意：

1. **使用 Element Plus 组件**：将 HTML 元素替换为对应的 Element Plus 组件
2. **应用设计令牌**：使用配置中的颜色、间距、字体
3. **支持主题切换**：使用 CSS 变量和 `data-theme` 属性
4. **遵循项目结构**：
   - 组件 → `src/vue-app/components/`
   - 布局 → `src/vue-app/layouts/`
   - 视图 → `src/vue-app/views/`

### 3. 示例转换

**SuperDesign HTML:**
```html
<button class="btn-primary">Click me</button>
```

**转换为 Vue 组件:**
```vue
<template>
  <el-button type="primary">Click me</el-button>
</template>
```

## 设计迭代流程

1. **在 SuperDesign 中迭代设计**
   ```bash
   superdesign iterate-design-draft --draft-id <id> -p "prompt1" -p "prompt2" --mode branch --json
   ```

2. **获取最新设计**
   ```bash
   superdesign get-design --draft-id <id> --json
   ```

3. **转换为 Vue 组件并集成**

4. **应用设计令牌和主题系统**

5. **测试暗色/亮色主题**

## 当前项目状态

- ✅ 设计令牌系统已创建
- ✅ 主题样式已更新使用设计令牌
- ✅ Element Plus 主题已配置
- ✅ 支持暗色/亮色主题切换

## 下一步

1. 根据 SuperDesign 设计优化现有组件样式
2. 创建新的组件时使用设计令牌
3. 确保所有组件支持主题切换
4. 保持设计一致性

## 参考资源

- SuperDesign 项目: https://app.superdesign.dev/teams/1a3049b7-7316-4ff4-b35e-e4608e105e60/projects/0b00d6da-2227-4999-8956-90d15b69e0b2
- Element Plus 文档: https://element-plus.org/
- 设计令牌配置: `.superdesign/config.json`
