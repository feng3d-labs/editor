# Message 组件功能验证指南

## 验证方法

### 方法 1: 浏览器控制台测试（推荐）

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **打开浏览器开发者工具**（F12）

3. **在控制台中执行以下命令**：

   ```javascript
   // 测试普通消息（白色）
   window.feng3d.globalEmitter.emit('message', '这是一条测试消息');
   
   // 测试错误消息（红色）
   window.feng3d.globalEmitter.emit('message.error', '这是一条错误消息');
   
   // 测试多条消息
   window.feng3d.globalEmitter.emit('message', '消息 1');
   window.feng3d.globalEmitter.emit('message', '消息 2');
   window.feng3d.globalEmitter.emit('message.error', '错误消息');
   ```

4. **观察效果**：
   - 消息应该出现在屏幕上方 1/4 位置
   - 消息应该水平居中
   - 普通消息显示为白色，错误消息显示为红色
   - 消息应该向上移动并逐渐淡出（动画持续 1 秒）
   - 多条消息应该按顺序显示（间隔 400ms）

### 方法 2: 通过现有功能触发

1. **编译脚本触发消息**：
   - 在编辑器中打开或修改脚本文件
   - 触发脚本编译（如果有自动编译功能）
   - 应该看到 "编译完成！" 的消息

2. **检查 ScriptCompiler.ts**：
   - 文件位置：`src/ScriptCompiler.ts:129`
   - 编译完成后会自动触发消息

### 方法 3: 添加临时测试代码

在 `src/Editor.ts` 的 `onAddedToStage` 方法末尾添加：

```typescript
// 临时测试代码 - 验证 Message 功能
setTimeout(() => {
    globalEmitter.emit('message', 'Message 组件测试：普通消息');
    setTimeout(() => {
        globalEmitter.emit('message.error', 'Message 组件测试：错误消息');
    }, 500);
}, 2000);
```

### 方法 4: 使用 Vue Devtools 检查

1. **打开 Vue Devtools**
2. **检查组件树**：
   - 应该能看到 `Message` 组件已挂载
   - 检查 `messages` 数组的变化
3. **观察响应式数据**：
   - 触发消息时，`messages` 数组应该增加
   - 动画完成后，消息应该从数组中移除

## 验证检查清单

### 功能验证
- [ ] 普通消息可以正常显示（白色）
- [ ] 错误消息可以正常显示（红色）
- [ ] 消息水平居中显示
- [ ] 消息位置在屏幕上方 1/4 处
- [ ] 消息向上移动动画正常
- [ ] 消息淡出动画正常
- [ ] 多条消息按顺序显示（间隔 400ms）
- [ ] 消息动画完成后自动移除

### 技术验证
- [ ] Vue 组件已正确挂载到 App.vue
- [ ] globalEmitter 事件监听正常
- [ ] TWEEN 动画正常工作
- [ ] 组件卸载时正确清理事件监听
- [ ] 适配器正常工作（Editor.ts 中使用）

### 兼容性验证
- [ ] 旧代码（通过 globalEmitter.emit）可以触发消息
- [ ] 新代码（Vue 组件）可以正常显示消息
- [ ] 不影响现有功能

## 常见问题排查

### 问题 1: 消息不显示
- **检查**：Vue 应用是否已挂载
- **检查**：Message 组件是否在 App.vue 中引入
- **检查**：浏览器控制台是否有错误

### 问题 2: 消息位置不对
- **检查**：CSS 样式是否正确
- **检查**：窗口大小变化时位置是否正确

### 问题 3: 动画不流畅
- **检查**：TWEEN 动画是否正常启动
- **检查**：requestAnimationFrame 是否正常工作

### 问题 4: 消息不消失
- **检查**：TWEEN 动画的 onComplete 回调是否执行
- **检查**：messages 数组是否正确移除元素

## 快速测试脚本

将以下代码保存为书签，点击即可测试：

```javascript
javascript:(function(){
    if(window.feng3d && window.feng3d.globalEmitter) {
        window.feng3d.globalEmitter.emit('message', '✅ Message 组件测试成功！');
        setTimeout(() => {
            window.feng3d.globalEmitter.emit('message.error', '❌ 错误消息测试');
        }, 500);
    } else {
        alert('feng3d 未加载，请先打开编辑器');
    }
})();
```

## 验证完成后

验证通过后，可以：
1. 删除临时测试代码（如果有）
2. 继续迁移 ToolTip 组件
3. 在迁移计划中标记 Message 组件验证完成

