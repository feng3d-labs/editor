# Agent 1 任务清单

> **Agent**: Agent 1  
> **优先级**: 🔴 高优先级  
> **预计时间**: 4-5 天

## 📋 任务总览

| 任务 | 复杂度 | 预计时间 | 状态 |
|------|--------|---------|------|
| MinMaxCurveEditor | ⭐⭐⭐⭐⭐ | 4-5 天 | ⏳ 待开始 |

---

## 🎯 任务 1: MinMaxCurveEditor

### 基本信息
- **原文件**: `src/ui/components/MinMaxCurveEditor.ts`
- **Vue 实现**: `src/vue-app/components/MinMaxCurveEditor.vue`
- **复杂度**: ⭐⭐⭐⭐⭐
- **预计时间**: 4-5 天
- **优先级**: 🔴 高

### 功能需求清单
- [ ] Canvas 绘制曲线和网格
- [ ] 关键点添加/删除/拖拽
- [ ] 控制点编辑（切线调整）
- [ ] WrapMode 设置（Clamp、Loop、PingPong）
- [ ] 预设曲线选择
- [ ] 双曲线模式支持

### 依赖检查
- [x] MinMaxCurveView（已完成）✅
- [x] ColorPickerView（已完成）✅

### 参考文件
- **原实现**: `src/ui/components/MinMaxCurveEditor.ts` (719 行)
- **相关组件**: `src/vue-app/components/MinMaxCurveView.vue`
- **相关组件**: `src/vue-app/objectview/oav/OAVMinMaxCurve.vue`
- **相关组件**: `src/vue-app/components/GradientEditor.vue` (参考 Canvas 绘制方式)

### 实现步骤

#### 第 1 步：理解原实现（0.5 天）
1. 仔细阅读 `src/ui/components/MinMaxCurveEditor.ts`
2. 理解曲线数据结构
3. 理解关键点和控制点的逻辑
4. 理解 WrapMode 的作用
5. 理解双曲线模式

#### 第 2 步：创建 Vue 组件框架（0.5 天）
1. 创建 `src/vue-app/components/MinMaxCurveEditor.vue`
2. 设置基本的 template、script、style 结构
3. 定义 props 和 emits
4. 定义响应式数据

#### 第 3 步：实现 Canvas 绘制（1 天）
1. 创建 Canvas 元素
2. 实现网格绘制
3. 实现坐标轴绘制
4. 实现曲线绘制（单曲线模式）
5. 实现双曲线模式绘制
6. 实现关键点绘制
7. 实现控制点绘制

#### 第 4 步：实现鼠标交互（1 天）
1. 实现鼠标点击检测（关键点、控制点、曲线）
2. 实现关键点拖拽
3. 实现控制点拖拽（切线调整）
4. 实现右键菜单（删除关键点）
5. 实现双击添加关键点
6. 实现滚轮缩放

#### 第 5 步：实现功能控制（1 天）
1. 实现 WrapMode 切换（Clamp、Loop、PingPong）
2. 实现预设曲线选择
3. 实现双曲线模式切换
4. 实现关键点值编辑（输入框）
5. 实现时间范围调整

#### 第 6 步：样式和优化（0.5 天）
1. 适配深色主题
2. 使用 Element Plus CSS 变量
3. 优化 Canvas 重绘性能
4. 添加响应式布局
5. 添加键盘快捷键支持

#### 第 7 步：测试和集成（0.5 天）
1. 测试所有功能
2. 与 OAVMinMaxCurve 集成测试
3. 修复 bug
4. 通过 lint 检查
5. 更新文档

### 技术要点

#### Canvas 绘制
- 使用 `ref` 获取 Canvas 元素
- 使用 `onMounted` 初始化 Canvas
- 使用 `watch` 监听数据变化并重绘
- 优化重绘性能（避免不必要的重绘）

#### 鼠标交互
- 使用 `@mousedown`、`@mousemove`、`@mouseup` 处理拖拽
- 计算鼠标坐标到 Canvas 坐标的转换
- 检测点击是否在关键点/控制点范围内
- 处理多选和框选

#### 数据结构
- 参考原实现的曲线数据结构
- 确保与 MinMaxCurveView 兼容
- 处理关键点数组的增删改

### 代码结构建议

```vue
<template>
  <div class="min-max-curve-editor">
    <!-- 工具栏 -->
    <div class="toolbar">
      <!-- WrapMode 选择 -->
      <!-- 预设曲线选择 -->
      <!-- 双曲线模式切换 -->
    </div>
    
    <!-- Canvas 区域 -->
    <div class="canvas-container">
      <canvas ref="canvasRef" @mousedown="onMouseDown" />
    </div>
    
    <!-- 关键点编辑面板 -->
    <div v-if="selectedKey" class="key-panel">
      <!-- 关键点值编辑 -->
    </div>
  </div>
</template>

<script setup lang="ts">
// 导入和类型定义
// 响应式数据
// 计算属性
// 方法
// 生命周期
</script>

<style scoped>
/* 样式 */
</style>
```

### 注意事项
1. **性能优化**: Canvas 重绘可能很频繁，需要优化
2. **精度问题**: 浮点数计算可能有精度问题，注意处理
3. **边界处理**: 关键点不能超出时间范围
4. **兼容性**: 确保与现有 OAVMinMaxCurve 组件兼容
5. **用户体验**: 提供清晰的视觉反馈和操作提示

### 完成标准
- [ ] 所有功能需求已实现
- [ ] 代码通过编译和 lint 检查
- [ ] 样式适配深色主题
- [ ] 与 OAVMinMaxCurve 集成正常
- [ ] 更新 `VUE_MIGRATION_PROGRESS.md` 文档
- [ ] 添加必要的注释和文档

---

## 📝 进度跟踪

### 当前状态
- **开始时间**: ⏳ 待开始
- **完成时间**: ⏳ 待完成
- **当前步骤**: 未开始

### 每日进度
- **Day 1**: ⏳
- **Day 2**: ⏳
- **Day 3**: ⏳
- **Day 4**: ⏳
- **Day 5**: ⏳

---

**最后更新**: 2024-12-19
