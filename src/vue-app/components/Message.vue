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
let messageIdCounter = 0;

// 获取消息样式
function getMessageStyle(msg: MessageItem) {
  return {
    top: `${msg.y}px`,
    opacity: msg.opacity,
  };
}

// 显示消息
function showMessage(type: 'normal' | 'error', text: string) {
  const initialY = window.innerHeight / 4;
  const targetY = window.innerHeight / 8;
  
  // 创建消息对象并添加到数组
  const message: MessageItem = {
    id: messageIdCounter++,
    type,
    text,
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
    })
    .start(); // start() 会自动启动更新循环（通过 Tween.ts 的重写）
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

