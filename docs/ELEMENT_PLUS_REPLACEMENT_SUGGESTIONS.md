# Element Plus 和图标替换建议

## 📋 替换清单

### ✅ 已替换的组件

1. **Menu 组件**
   - ✅ 子菜单箭头：`▶` → `<Icon icon="mdi:chevron-right" />`

2. **TabPanel 组件**
   - ✅ 关闭按钮：`×` → `<Icon icon="mdi:close" />`

---

## 🎯 Vue 组件中可以替换的部分

### 1. LayoutTest.vue

#### 1.1 按钮替换
**位置**：`src/vue-app/pages/LayoutTest.vue:5`

**当前代码**：
```vue
<button @click="closeTest" class="close-button">关闭</button>
```

**建议替换为**：
```vue
<el-button type="primary" @click="closeTest">
  <Icon icon="mdi:close" :size="16" style="margin-right: 4px" />
  关闭
</el-button>
```

**收益**：
- ✅ 使用 Element Plus 统一按钮样式
- ✅ 添加图标提升视觉效果
- ✅ 减少自定义 CSS

---

### 2. Message 组件

#### 2.1 可以考虑使用 Element Plus 的 ElMessage

**当前实现**：`src/vue-app/components/Message.vue` - 自定义实现

**建议**：
- **选项 1**：继续使用自定义实现（当前有特殊动画需求）
- **选项 2**：使用 `ElMessage` + 自定义样式（简化代码）

**如果选择选项 2**：
```typescript
import { ElMessage } from 'element-plus';

// 替换 showMessage 函数
function showMessage(type: 'normal' | 'error', text: string) {
  ElMessage({
    message: text,
    type: type === 'error' ? 'error' : 'success',
    duration: 2000,
    showClose: true,
  });
}
```

**建议**：**保持当前实现**，因为：
- ✅ 有特殊的动画效果（TWEEN 动画）
- ✅ 有消息队列管理
- ✅ 有特殊的定位需求

---

### 3. ToolTip 组件

#### 3.1 可以考虑使用 Element Plus 的 ElTooltip

**当前实现**：`src/vue-app/components/ToolTip.vue` - 自定义实现

**建议**：
- **选项 1**：继续使用自定义实现（当前通过全局事件触发）
- **选项 2**：使用 `ElTooltip`（需要修改调用方式）

**如果选择选项 2**：
```vue
<el-tooltip content="提示文本" placement="top">
  <div>悬停显示提示</div>
</el-tooltip>
```

**建议**：**保持当前实现**，因为：
- ✅ 与 Egret 代码兼容（通过全局事件）
- ✅ 支持动态位置计算
- ✅ 已有适配层（ToolTipAdapter）

---

## 🔄 Egret 组件迁移建议（未来迁移时）

### 高优先级替换

#### 1. Button 组件

**使用位置**（89 处）：
- `src/ui/TopView.ts` - 顶部工具栏按钮
- `src/ui/inspector/InspectorView.ts` - 返回按钮
- `src/ui/components/WindowView.ts` - 关闭按钮
- `src/ui/components/ComponentView.ts` - 操作按钮
- 等等...

**替换方案**：
```vue
<!-- 替换前（Egret） -->
<eui.Button label="确定" />

<!-- 替换后（Element Plus） -->
<el-button type="primary">确定</el-button>
```

**图标建议**：
- 帮助按钮：`mdi:help-circle`
- 设置按钮：`mdi:cog`
- 播放按钮：`mdi:play`
- 暂停按钮：`mdi:pause`
- 停止按钮：`mdi:stop`
- 关闭按钮：`mdi:close`
- 返回按钮：`mdi:arrow-left`

---

#### 2. TextInput 组件

**使用位置**（50+ 处）：
- `src/objectview/ov/OVTransform.ts` - 坐标输入（x, y, z, rx, ry, rz, sx, sy, sz）
- `src/objectview/oav/OAVNumber.ts` - 数字输入
- `src/objectview/oav/OAVString.ts` - 文本输入
- `src/ui/components/ColorPickerView.ts` - 颜色值输入（R, G, B, A）
- 等等...

**替换方案**：
```vue
<!-- 替换前（Egret） -->
<eui.TextInput text="{value}" />

<!-- 替换后（Element Plus） -->
<el-input v-model="value" />
```

**特殊场景**：
- **数字输入**：使用 `el-input-number`
- **带清空按钮**：使用 `clearable` 属性
- **带图标**：使用 `prefix-icon` 或 `suffix-icon`

---

#### 3. CheckBox 组件

**使用位置**（10+ 处）：
- `src/ui/components/ComponentView.ts` - enabled 复选框
- `src/objectview/oav/OAVGameObjectName.ts` - visible、mouseEnabled 复选框
- `src/objectview/oav/OAVBoolean.ts` - 布尔值显示
- 等等...

**替换方案**：
```vue
<!-- 替换前（Egret） -->
<eui.CheckBox selected="{value}" />

<!-- 替换后（Element Plus） -->
<el-checkbox v-model="value" />
```

---

#### 4. ComboBox 组件

**使用位置**：
- `src/ui/components/ComboBox.ts` - 下拉选择

**替换方案**：
```vue
<!-- 替换前（Egret） -->
<eui.ComboBox dataProvider="{options}" />

<!-- 替换后（Element Plus） -->
<el-select v-model="value">
  <el-option
    v-for="item in options"
    :key="item.value"
    :label="item.label"
    :value="item.value"
  />
</el-select>
```

---

#### 5. HSlider / VSlider 组件

**使用位置**：
- `src/ui/components/binders/NumberSliderTextInputBinder.ts` - 数字滑块
- `src/ui/components/GradientEditor.ts` - 透明度滑块
- 等等...

**替换方案**：
```vue
<!-- 替换前（Egret） -->
<eui.HSlider value="{value}" minimum="0" maximum="100" />

<!-- 替换后（Element Plus） -->
<el-slider v-model="value" :min="0" :max="100" />
```

**组合使用**（滑块 + 输入框）：
```vue
<el-row :gutter="10">
  <el-col :span="16">
    <el-slider v-model="value" :min="0" :max="100" />
  </el-col>
  <el-col :span="8">
    <el-input-number v-model="value" :min="0" :max="100" />
  </el-col>
</el-row>
```

---

#### 6. ToggleSwitch 组件

**使用位置**：
- 开关组件

**替换方案**：
```vue
<!-- 替换前（Egret） -->
<eui.ToggleSwitch selected="{value}" />

<!-- 替换后（Element Plus） -->
<el-switch v-model="value" />
```

---

### 中优先级替换

#### 7. Accordion 组件

**使用位置**：
- `src/ui/components/Accordion.ts` - 手风琴组件

**替换方案**：
```vue
<!-- 替换后（Element Plus） -->
<el-collapse v-model="activeNames">
  <el-collapse-item title="标题" name="1">
    内容
  </el-collapse-item>
</el-collapse>
```

---

#### 8. TabView 组件

**使用位置**：
- `src/ui/components/TabView.ts` - 标签页组件

**替换方案**：
```vue
<!-- 替换后（Element Plus） -->
<el-tabs v-model="activeName">
  <el-tab-pane label="标签1" name="first">内容1</el-tab-pane>
  <el-tab-pane label="标签2" name="second">内容2</el-tab-pane>
</el-tabs>
```

**注意**：项目已有自研 `TabPanel` 组件，可以继续使用或评估是否需要替换。

---

#### 9. Tree 组件

**使用位置**：
- `src/ui/components/TreeNode.ts` - 树节点
- `src/ui/components/TreeItemRenderer.ts` - 树项渲染器

**替换方案**：
```vue
<!-- 替换后（Element Plus） -->
<el-tree
  :data="treeData"
  :props="{ children: 'children', label: 'label' }"
  @node-click="handleNodeClick"
/>
```

---

### 低优先级替换

#### 10. ColorPicker 组件

**使用位置**：
- `src/ui/components/ColorPicker.ts` - 颜色选择器

**替换方案**：
```vue
<!-- 替换后（Element Plus） -->
<el-color-picker v-model="color" />
```

**注意**：如果当前实现有特殊功能，可能需要保留或扩展。

---

#### 11. ProgressBar 组件

**使用位置**：
- 进度条显示

**替换方案**：
```vue
<!-- 替换后（Element Plus） -->
<el-progress :percentage="percentage" />
```

---

## 🎨 图标替换建议

### 常用图标映射

| 用途 | 推荐图标 | 图标集 |
|------|---------|--------|
| 关闭 | `mdi:close` | Material Design Icons |
| 确认 | `mdi:check` | Material Design Icons |
| 设置 | `mdi:cog` | Material Design Icons |
| 帮助 | `mdi:help-circle` | Material Design Icons |
| 播放 | `mdi:play` | Material Design Icons |
| 暂停 | `mdi:pause` | Material Design Icons |
| 停止 | `mdi:stop` | Material Design Icons |
| 下一步 | `mdi:skip-next` | Material Design Icons |
| 返回 | `mdi:arrow-left` | Material Design Icons |
| 前进 | `mdi:arrow-right` | Material Design Icons |
| 向上 | `mdi:chevron-up` | Material Design Icons |
| 向下 | `mdi:chevron-down` | Material Design Icons |
| 文件夹 | `material-symbols:folder` | Material Symbols |
| 文件 | `material-symbols:file` | Material Symbols |
| 搜索 | `mdi:magnify` | Material Design Icons |
| 添加 | `mdi:plus` | Material Design Icons |
| 删除 | `mdi:delete` | Material Design Icons |
| 编辑 | `mdi:pencil` | Material Design Icons |
| 保存 | `mdi:content-save` | Material Design Icons |
| 刷新 | `mdi:refresh` | Material Design Icons |

---

## 📝 实施优先级

### 立即实施（Vue 组件）

1. ✅ **LayoutTest.vue 按钮** - 简单替换，立即收益
2. ⏳ **评估 Message 组件** - 保持当前实现（有特殊需求）
3. ⏳ **评估 ToolTip 组件** - 保持当前实现（有兼容性需求）

### 迁移时实施（Egret → Vue）

1. **高优先级**：
   - Button → el-button（89 处）
   - TextInput → el-input（50+ 处）
   - CheckBox → el-checkbox（10+ 处）

2. **中优先级**：
   - ComboBox → el-select
   - HSlider/VSlider → el-slider
   - ToggleSwitch → el-switch

3. **低优先级**：
   - Accordion → el-collapse
   - TabView → el-tabs（或继续使用自研 TabPanel）
   - Tree → el-tree

---

## 🔧 替换示例

### 示例 1：按钮替换

**替换前**：
```vue
<button @click="handleClick" class="custom-button">确定</button>
```

**替换后**：
```vue
<el-button type="primary" @click="handleClick">
  <Icon icon="mdi:check" :size="16" style="margin-right: 4px" />
  确定
</el-button>
```

### 示例 2：输入框替换

**替换前**：
```vue
<input v-model="value" type="text" placeholder="请输入" />
```

**替换后**：
```vue
<el-input
  v-model="value"
  placeholder="请输入"
  clearable
>
  <template #prefix>
    <Icon icon="mdi:magnify" />
  </template>
</el-input>
```

### 示例 3：复选框替换

**替换前**：
```vue
<input v-model="checked" type="checkbox" />
<label>启用</label>
```

**替换后**：
```vue
<el-checkbox v-model="checked">启用</el-checkbox>
```

---

## ⚠️ 注意事项

1. **保持兼容性**：迁移 Egret 组件时，需要确保适配层正常工作
2. **样式一致性**：确保 Element Plus 组件与编辑器深色主题一致
3. **功能完整性**：某些 Egret 组件可能有特殊功能，需要评估是否完全替换
4. **性能考虑**：按需引入 Element Plus 组件，避免打包体积过大

---

## 📚 参考资源

- **Element Plus 文档**：https://element-plus.org/zh-CN/
- **图标搜索**：https://icon-sets.iconify.design/
- **使用指南**：`docs/ELEMENT_PLUS_USAGE.md`

