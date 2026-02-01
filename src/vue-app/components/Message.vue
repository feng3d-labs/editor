<!--
  ⚠️ 自定义组件说明：
  此组件保持自定义实现，未使用 Element Plus 的 ElMessage，原因：
  1. 需要特殊的 TWEEN 动画效果（从下往上淡出）
  2. 需要消息队列管理，防止消息重叠
  3. 需要动态计算消息位置（根据已显示消息数量）
  
  如果未来需要替换为 ElMessage，需要：
  - 实现自定义动画
  - 实现消息队列
  - 修改全局事件触发方式
-->
<template>
  <Teleport to="body">
    <div class="message-container">
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['message-item', msg.type === 'error' ? 'message-error' : 'message-normal']"
        :style="getMessageStyle(msg)"
      >
        {{ msg.text }}
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { globalEmitter, IEvent } from 'feng3d';
import { Tween, Easing } from '@tweenjs/tween.js';

interface MessageItem {
  id: number;
  type: 'normal' | 'error';
  text: string;
  y: number;
  opacity: number;
}

const messages = ref<MessageItem[]>([]);
const messageQueue = ref<Array<{ type: 'normal' | 'error'; text: string }>>([]);
let messageIdCounter = 0;
let isShowingMessage = false;
const interval = 400; // 消息显示间隔（毫秒）
const messageSpacing = 50; // 消息之间的垂直间距（像素）

// 获取消息样式
function getMessageStyle(msg: MessageItem) {
  return {
    top: `${msg.y}px`,
    opacity: msg.opacity,
  };
}

// 计算消息的初始 Y 位置（根据当前显示的消息数量）
function calculateInitialY(): number {
  // 基础位置：屏幕上方 1/4
  const baseY = window.innerHeight / 4;
  // 根据已显示的消息数量，向下偏移
  const offsetY = messages.value.length * messageSpacing;
  return baseY - offsetY;
}

// 显示消息队列中的下一条消息
function showNextMessage() {
  if (messageQueue.value.length === 0) {
    isShowingMessage = false;
    return;
  }

  isShowingMessage = true;
  const messageData = messageQueue.value.shift()!;
  const initialY = calculateInitialY();
  const targetY = window.innerHeight / 8;
  
  // 创建消息对象并添加到数组
  const message: MessageItem = {
    id: messageIdCounter++,
    type: messageData.type,
    text: messageData.text,
    y: initialY,
    opacity: 1,
  };

  messages.value.push(message);
  
  // 获取消息在数组中的索引（用于后续更新）
  const messageIndex = messages.value.length - 1;

  // 使用 TWEEN 动画
  // 注意：使用项目中的 Tween 工具，它会自动管理更新循环
  // 创建动画对象（不直接使用 message，避免响应式问题）
  const tweenObject = { y: initialY, opacity: 1 };
  
  new Tween(tweenObject)
    .to({ y: targetY, opacity: 0 }, 1000)
    .easing(Easing.Sinusoidal.In)
    .onUpdate(() => {
      // 直接更新数组中的对象属性，Vue 3 会自动检测并更新视图
      const msg = messages.value[messageIndex];
      if (msg && msg.id === message.id) {
        msg.y = tweenObject.y;
        msg.opacity = tweenObject.opacity;
      }
    })
    .onComplete(() => {
      // 动画完成后移除消息
      const index = messages.value.findIndex(m => m.id === message.id);
      if (index > -1) {
        messages.value.splice(index, 1);
      }
      
      // 延迟后显示下一条消息（避免重叠）
      setTimeout(() => {
        showNextMessage();
      }, interval);
    })
    .start(); // start() 会自动启动更新循环（通过 Tween.ts 的重写）
}

// 显示消息（添加到队列）
function showMessage(type: 'normal' | 'error', text: string) {
  messageQueue.value.push({ type, text });
  
  // 如果当前没有在显示消息，立即开始显示
  if (!isShowingMessage) {
    showNextMessage();
  }
}

// 处理普通消息
function onMessage(event: IEvent<string>) {
  showMessage('normal', event.data);
}

// 处理错误消息
function onErrorMessage(event: IEvent<string>) {
  showMessage('error', event.data);
}

onMounted(() => {
  globalEmitter.on('message', onMessage);
  globalEmitter.on('message.error', onErrorMessage);
});

onUnmounted(() => {
  globalEmitter.off('message', onMessage);
  globalEmitter.off('message.error', onErrorMessage);
});
</script>

<style scoped>
.message-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.message-item {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 30px;
  font-weight: bold;
  text-align: center;
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.message-normal {
  color: #ffffff;
}

.message-error {
  color: #ff0000;
}

</style>

