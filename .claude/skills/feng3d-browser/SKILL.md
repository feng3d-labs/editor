---
name: feng3d-browser
description: Browser automation for feng3d-editor project. Opens local development server, takes screenshots, tests UI, checks colors, and detects runtime errors. Triggers: "open editor", "test UI", "screenshot editor", "check colors", "open settings", "check errors".
allowed-tools: Bash(node, npx), Read, Write
---

# Feng3D Editor Browser Automation

> **重要**: 所有临时脚本和截图文件应保存在 `.temp/` 目录中（已加入 .gitignore）。

## 依赖检查

### Playwright（必需）

```bash
# 检查是否已安装
npm list playwright

# 如果未安装，安装 Playwright
npm install -D playwright
npx playwright install chromium
```

### MCP 图像分析工具（可选，用于分析截图）

当需要分析截图中的 UI 或颜色时使用。

**检查是否可用**：尝试调用 `mcp__zai-mcp-server__analyze_image` 工具。

**安装引导**：如果不可用，请按照 MCP 服务器配置文档进行安装。

## 工作流程

1. 创建临时脚本到 `.temp/` 目录
2. 运行脚本生成截图或测试数据
3. 分析结果，检测运行时错误
4. 临时文件可保留，但 `.temp/` 文件夹超过 100MB 时提醒用户清理

## Quick Start

```bash
# 快速截图
npx playwright screenshot http://localhost:PORT/ .temp/screenshot.png

# 交互式测试
npx playwright codegen http://localhost:PORT/

# 运行脚本（无头模式）
node .temp/script.js

# 调试模式（可见浏览器）
HEADED=1 node .temp/script.js
```

## 端口配置

从项目 `vite.config.js` 读取当前端口配置。

## 通用脚本模板

### 基础截图

```javascript
const { chromium } = require('playwright');

(async () => {
  const headed = process.env.HEADED === '1';
  const browser = await chromium.launch({ headless: !headed });
  const page = await browser.newPage();

  await page.goto('http://localhost:PORT/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '.temp/screenshot.png' });

  await browser.close();
})();
```

### 带错误检测的截图

```javascript
const { chromium } = require('playwright');

(async () => {
  const headed = process.env.HEADED === '1';
  const browser = await chromium.launch({ headless: !headed });
  const page = await browser.newPage();

  const errors = [];

  // 监听控制台错误
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({ type: 'console', text: msg.text() });
      console.log('Console error:', msg.text());
    }
  });

  // 监听页面错误
  page.on('pageerror', err => {
    errors.push({ type: 'page', message: err.message, stack: err.stack });
    console.log('Page error:', err.message);
  });

  // 监听请求失败
  page.on('requestfailed', request => {
    const failure = request.failure();
    if (failure) {
      errors.push({
        type: 'request',
        url: request.url(),
        failure: failure.errorText
      });
      console.log('Request failed:', request.url(), failure.errorText());
    }
  });

  await page.goto('http://localhost:PORT/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // 检查 Vite 错误覆盖层
  const hasViteError = await page.locator('vite-error-overlay').count() > 0;
  if (hasViteError) {
    const errorText = await page.locator('vite-error-overlay').innerText();
    errors.push({ type: 'vite', text: errorText });
  }

  // 输出错误摘要
  console.log('\n=== Error Summary ===');
  console.log(`Total errors: ${errors.length}`);
  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach((err, i) => {
      console.log(`\n${i + 1}. [${err.type}]`);
      if (err.text) console.log('   ', err.text.substring(0, 200));
      if (err.message) console.log('   ', err.message);
      if (err.url) console.log('   URL:', err.url);
      if (err.failure) console.log('   ', err.failure);
    });
  }

  await page.screenshot({ path: '.temp/screenshot.png' });

  // 检查 .temp 文件夹大小
  try {
    const { execSync } = require('child_process');
    const size = execSync('du -sh .temp/', { encoding: 'utf8' }).trim();
    console.log('\nTemp folder size:', size);
  } catch (e) {}

  await browser.close();
})();
```

### 点击元素并截图

```javascript
const { chromium } = require('playwright');

(async () => {
  const headed = process.env.HEADED === '1';
  const browser = await chromium.launch({ headless: !headed });
  const page = await browser.newPage();

  await page.goto('http://localhost:PORT/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 点击按钮
  await page.locator('button').nth(INDEX).click();
  await page.waitForTimeout(500);

  await page.screenshot({ path: '.temp/result.png' });
  await browser.close();
})();
```

### 检查元素颜色

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:PORT/', { waitUntil: 'networkidle' });

  const element = await page.locator('.selector').first();
  const styles = await element.evaluate((el) => {
    const s = window.getComputedStyle(el);
    return {
      backgroundColor: s.backgroundColor,
      color: s.color,
      borderColor: s.borderColor
    };
  });

  console.log(JSON.stringify(styles, null, 2));
  await browser.close();
})();
```

### 打开下拉菜单并截图

```javascript
const { chromium } = require('playwright');

(async () => {
  const headed = process.env.HEADED === '1';
  const browser = await chromium.launch({ headless: !headed });
  const page = await browser.newPage();

  await page.goto('http://localhost:PORT/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 点击下拉框
  await page.locator('.selector').first().click();
  await page.waitForTimeout(500);

  await page.screenshot({ path: '.temp/dropdown-open.png' });
  await browser.close();
})();
```

## 截图分析（使用 MCP）

截图后可以使用 MCP 图像分析工具检查 UI：

1. 运行截图脚本生成 `.temp/screenshot.png`
2. 使用 `mcp__zai-mcp-server__analyze_image` 分析截图
3. 检查颜色、布局、UI 元素等

## 清理临时文件

```bash
# 查看 .temp 文件夹大小
du -sh .temp/

# 清理所有临时文件
rm -rf .temp/*
```

## Playwright API 参考

### 导航

```javascript
await page.goto(url, { waitUntil: 'networkidle' });
await page.goForward();
await page.goBack();
await page.reload();
```

### 等待

```javascript
await page.waitForTimeout(ms);
await page.waitForSelector(selector);
await page.waitForLoadState('networkidle');
```

### 元素操作

```javascript
// 定位
await page.locator(selector).first()
await page.locator(selector).nth(index)
await page.getByText(text)
await page.getByTitle(title)

// 操作
await element.click()
await element.fill(text)
await element.hover()
await element.selectOption(value)
```

### 截图

```javascript
await page.screenshot({ path: 'file.png' });
await page.screenshot({ path: 'file.png', fullPage: true });
await page.locator(selector).screenshot({ path: 'file.png' });
```

### 信息获取

```javascript
const text = await element.innerText();
const attr = await element.getAttribute('name');
const count = await page.locator(selector).count();
const html = await page.content();
```

### 事件监听

```javascript
page.on('console', msg => {});
page.on('pageerror', err => {});
page.on('requestfailed', request => {});
page.on('response', response => {});
```
