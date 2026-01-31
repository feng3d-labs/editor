# 自定义组件说明文档

本文档记录项目中保持自定义实现的组件及其原因，确保团队理解为什么这些组件未使用 Element Plus。

---

## 📋 自定义组件清单

### 1. Message 组件 (`src/vue-app/components/Message.vue`)

**状态**：✅ 保持自定义实现

**原因**：
1. **特殊动画需求**：需要 TWEEN 动画效果（从下往上淡出），Element Plus 的 ElMessage 不支持自定义动画
2. **消息队列管理**：需要防止消息重叠，实现消息队列机制
3. **动态位置计算**：根据已显示消息数量动态计算位置
4. **Egret 兼容性**：通过全局事件 `message` 和 `message.error` 触发，与 Egret 代码兼容

**如果替换为 ElMessage 需要**：
- 实现自定义动画（可能无法完全满足需求）
- 实现消息队列管理
- 修改全局事件触发方式

**建议**：✅ **保持自定义实现**

---

### 2. ToolTip 组件 (`src/vue-app/components/ToolTip.vue`)

**状态**：✅ 保持自定义实现

**原因**：
1. **Egret 兼容性**：通过全局事件 `tooltip.show/tooltip.hide` 触发，与 Egret 代码兼容
2. **动态位置计算**：需要跟随鼠标位置动态计算
3. **Egret DisplayObject 支持**：需要支持 Egret DisplayObject 的 tooltip 注册机制
4. **适配层需求**：已有 ToolTipAdapter 与旧代码桥接

**如果替换为 ElTooltip 需要**：
- 修改所有 Egret 代码的 tooltip 触发方式（工作量巨大）
- 实现动态位置计算
- 移除 ToolTipAdapter 适配层
- 重新实现 Egret DisplayObject 的 tooltip 注册

**建议**：✅ **保持自定义实现**

---

### 3. Menu 组件 (`src/vue-app/components/Menu.vue`)

**状态**：✅ 保持自定义实现

**原因**：
1. **Egret 兼容性**：通过全局事件 `menu.show/menu.hide` 触发，与 Egret 代码兼容
2. **多级子菜单**：需要支持递归嵌套的多级子菜单
3. **动态位置计算**：需要防止菜单溢出屏幕，动态调整位置
4. **特殊交互**：需要支持右键菜单的特殊交互（点击外部关闭、键盘导航等）
5. **适配层需求**：已有 MenuAdapter 与旧代码桥接

**如果替换为 ElDropdownMenu 需要**：
- 修改所有 Egret 代码的菜单触发方式（工作量巨大）
- 实现多级子菜单支持
- 实现动态位置计算
- 移除 MenuAdapter 适配层

**建议**：✅ **保持自定义实现**

---

### 4. SplitPanel 组件 (`src/vue-app/components/SplitPanel.vue`)

**状态**：✅ 保持自定义实现

**原因**：
1. **Element Plus 无对应组件**：Element Plus 没有提供 SplitPanel 组件
2. **专业布局需求**：需要支持水平和垂直两种方向
3. **最小尺寸限制**：需要支持最小尺寸限制
4. **拖拽调整**：需要支持拖拽调整分割比例
5. **深度集成**：需要与编辑器布局系统深度集成

**如果使用第三方库**：
- 可以考虑使用 `vue-split-pane` 等库，但需要评估兼容性和样式定制

**建议**：✅ **保持自定义实现**（这是合理的专业组件）

---

### 5. TabPanel 组件 (`src/vue-app/components/TabPanel.vue`)

**状态**：✅ 保持自定义实现

**原因**：
1. **布局系统集成**：需要与编辑器布局系统深度集成（与 SplitPanel 配合使用）
2. **动态标签页**：需要支持通过 slot 传递内容的动态标签页
3. **标签页关闭**：需要支持标签页关闭功能
4. **样式定制**：需要自定义样式以匹配编辑器深色主题
5. **已有实现**：已有完整的实现和测试

**如果替换为 ElTabs 需要**：
- 重新实现标签页关闭功能
- 调整样式以匹配编辑器主题
- 修改与 SplitPanel 的集成方式

**建议**：✅ **保持自定义实现**（已有完整实现，替换成本高）

---

## 🎯 总结

### 保持自定义的组件

| 组件 | 原因 | 优先级 |
|------|------|--------|
| Message | 特殊动画、消息队列 | ✅ 必须自定义 |
| ToolTip | Egret 兼容性、动态位置 | ✅ 必须自定义 |
| Menu | Egret 兼容性、多级菜单 | ✅ 必须自定义 |
| SplitPanel | Element Plus 无对应组件 | ✅ 合理自定义 |
| TabPanel | 布局系统集成、已有实现 | ✅ 合理自定义 |

### 使用 Element Plus 的组件

- ✅ **按钮**：使用 `el-button`
- ✅ **输入框**：使用 `el-input`（迁移时）
- ✅ **选择器**：使用 `el-select`（迁移时）
- ✅ **复选框**：使用 `el-checkbox`（迁移时）
- ✅ **滑块**：使用 `el-slider`（迁移时）
- ✅ **开关**：使用 `el-switch`（迁移时）
- ✅ **图标**：使用 `@iconify/vue` 的 Icon 组件

---

## 📝 原则

1. **优先使用 Element Plus**：对于基础组件（Button、Input、Select 等），优先使用 Element Plus
2. **合理自定义**：对于 Element Plus 没有的组件或特殊需求，保持自定义实现
3. **明确说明**：所有自定义组件必须添加注释说明原因
4. **定期评估**：随着 Element Plus 更新，定期评估是否可以替换自定义组件

---

## 🔄 未来评估

定期评估以下组件是否可以替换：

1. **TabPanel**：如果 Element Plus 的 ElTabs 功能增强，可以考虑替换
2. **SplitPanel**：如果 Element Plus 或第三方库提供更好的实现，可以考虑替换
3. **Message**：如果 Element Plus 支持自定义动画，可以考虑替换
4. **ToolTip**：如果 Egret 代码完全迁移，可以考虑替换
5. **Menu**：如果 Egret 代码完全迁移，可以考虑替换

---

## ⚠️ 注意事项

- 所有自定义组件都应在文件顶部添加注释说明原因
- 如果未来需要替换，需要充分评估影响范围
- 替换前需要确保功能完整性和兼容性

