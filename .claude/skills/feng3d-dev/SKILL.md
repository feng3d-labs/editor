---
name: feng3d-dev
description: Feng3D Editor 开发技能 - 包含浏览器自动化测试、Bug修复流程、代码规范等。Triggers: "测试", "bug", "修复", "不显示", "错误", "失败", "问题", "screenshot", "验证"
allowed-tools: Bash(node, npx), Read, Write, Edit, mcp__playwright__browser_*, mcp__zai-mcp-server__*
---

# Feng3D Editor 开发技能

> **重要**: 所有临时脚本和截图文件应保存在 `.temp/` 目录中（已加入 .gitignore）。

## 目录

1. [浏览器自动化测试](#浏览器自动化测试)
2. [Bug 修复流程](#bug-修复流程)
3. [开发规范](#开发规范)

---

## 浏览器自动化测试

### 依赖检查

```bash
# 检查是否已安装
npm list playwright

# 如果未安装，安装 Playwright
npm install -D playwright
npx playwright install chromium
```

### 端口配置

从项目 `vite.config.js` 读取当前端口配置（默认：3000）。

### 项目特定元素定位

```javascript
// 设置按钮 - 通过 title 属性
await page.locator('[title="设置"]').click();

// 帮助按钮
await page.locator('[title="帮助"]').click();

// 二维码按钮
await page.locator('[title="二维码"]').click();
```

### 通用脚本模板

#### 基础截图

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '.temp/screenshot.png' });
  await browser.close();
})();
```

#### 错误检测

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') errors.push({ type: 'console', text: msg.text() });
  });

  page.on('pageerror', err => {
    errors.push({ type: 'page', message: err.message });
  });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  console.log(`错误数量: ${errors.length}`);
  await browser.close();
})();
```

---

## Bug 修复流程

### 核心口诀

**理解 → 还原 → 最小改 → 一次验 → 精简 → 停手**

### 阶段一：问题诊断

1. **理解问题**
   - 仔细阅读用户问题描述
   - 不要急于修改代码，先理解问题本质
   - 区分问题类型：DOM/CSS、3D渲染、逻辑、数据流

2. **收集信息**
   - 使用浏览器工具获取：DOM结构、样式、Canvas内容
   - 检查控制台错误日志
   - 对比工作状态和故障状态

### 阶段二：定位原因

1. **历史回溯** - 检查代码是否之前被修改过
2. **变更追踪** - 每次修改前先 Read 文件确认当前状态

### 阶段三：还原与最小修改

1. **还原所有修改** - 回到原始问题状态
2. **最小修改验证** - 一次只修改一个问题点
3. **反复验证精简** - 确认每个修改是必须的，去掉不必要的修改

### 阶段四：验证规范

1. **验证时机** - 修改完成后验证一次即可，不要反复刷新
2. **验证方法** - 优先用 browser_evaluate 获取数据
3. **测试文件** - 统一存放在 `.temp` 目录

### 阶段五：停止与等待

1. **完成后停止** - 问题解决后不要再触碰代码
2. **等待确认** - 等待用户确认或下一步指示

---

## 开发规范

### 禁止事项

- ❌ 修改已工作的代码
- ❌ 反复刷新验证（触发热重载）
- ❌ 过度修改引入新问题
- ❌ 自作主张继续操作

### 测试文件规范

- 所有测试截图、调试文件统一存放在 `.temp` 目录
- 文件命名使用时间戳便于排序

### 修改原则

- 一次只修改一个问题点
- 修改后立即验证
- 如果无效，回滚后再尝试下一个方案
- 最终保留最小修改集

---

## GitHub Pages 部署验证

```javascript
const { chromium } = require('playwright');
const PAGES_URL = 'https://feng3d-labs.github.io/editor/';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(PAGES_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const title = await page.title();
  console.log('页面标题:', title);

  await browser.close();
})();
```
