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

1. 创建临时脚本到 `.temp/` 目录（使用时间戳命名）
2. 运行脚本生成截图或测试数据
3. 分析结果，检测运行时错误
4. 临时文件可保留，但 `.temp/` 文件夹超过 100MB 时提醒用户清理

### 文件命名规范

使用时间戳命名，便于排序和识别：

```javascript
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const screenshotPath = `.temp/${timestamp}-description.png`;
// 示例: 2026-02-06T17-53-51-dropdown-open.png
```

## Quick Start

```bash
# 快速截图
npx playwright screenshot http://localhost:3000/ .temp/screenshot.png

# 交互式测试
npx playwright codegen http://localhost:3000/

# 运行脚本（无头模式）
node .temp/script.js

# 调试模式（可见浏览器）
HEADED=1 node .temp/script.js
```

## 端口配置

从项目 `vite.config.js` 读取当前端口配置（默认：3000）。

## 项目特定元素定位

### 常用按钮定位

```javascript
// 设置按钮 - 通过 title 属性
await page.locator('[title="设置"]').click();
// 或索引（可能变化）
await page.locator('button').nth(2).click();

// 帮助按钮
await page.locator('[title="帮助"]').click();

// 二维码按钮
await page.locator('[title="二维码"]').click();
```

### 设置对话框元素

```javascript
// 主题下拉框
await page.locator('.settings-select-full').click();

// 经典主题按钮
await page.locator('.classic-theme-buttons .el-button').nth(0).click(); // 暗色
await page.locator('.classic-theme-buttons .el-button').nth(1).click(); // 亮色
```

### Element Plus 组件注意事项

```javascript
// Element Plus Select 使用 .el-select__wrapper 而不是 .el-input__wrapper
// 检查样式时使用正确的选择器
const styles = await page.locator('.settings-select-full').evaluate((el) => {
  const wrapper = el.querySelector('.el-select__wrapper');
  if (!wrapper) return { error: 'Wrapper not found' };
  const s = window.getComputedStyle(wrapper);
  return {
    backgroundColor: s.backgroundColor,
    borderColor: s.borderColor
  };
});
```

## 通用脚本模板

### 基础截图

```javascript
const { chromium } = require('playwright');

(async () => {
  const headed = process.env.HEADED === '1';
  const browser = await chromium.launch({ headless: !headed });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '.temp/screenshot.png' });

  await browser.close();
})();
```

### 调试模式（详细日志）

```javascript
const { chromium } = require('playwright');

(async () => {
  const headed = process.env.HEADED === '1' || true;
  const browser = await chromium.launch({
    headless: !headed,
    slowMo: 100 // 慢速模式
  });
  const page = await browser.newPage();

  const errors = [];
  const actions = [];

  // 监听控制台
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({ type: 'console', text: msg.text() });
      console.log('❌ Console error:', msg.text());
    }
  });

  page.on('pageerror', err => {
    errors.push({ type: 'page', message: err.message });
    console.log('❌ Page error:', err.message);
  });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  // 检查按钮
  const buttonCount = await page.locator('button').count();
  console.log(`✓ 按钮数量: ${buttonCount}`);

  // 点击设置按钮
  await page.locator('[title="设置"]').first().click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: '.temp/debug.png' });

  // 输出摘要
  console.log(`\n错误数量: ${errors.length}`);
  await page.waitForTimeout(3000);

  await browser.close();
})();
```

### 打开设置对话框

```javascript
const { chromium } = require('playwright');

(async () => {
  const headed = process.env.HEADED === '1';
  const browser = await chromium.launch({ headless: !headed });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  // 点击设置按钮
  await page.locator('[title="设置"]').first().click();
  await page.waitForTimeout(500);

  await page.screenshot({ path: '.temp/settings.png' });
  console.log('✓ 截图保存到 .temp/settings.png');

  await browser.close();
})();
```

### 点击主题下拉框并截图

```javascript
const { chromium } = require('playwright');

(async () => {
  const headed = process.env.HEADED === '1';
  const browser = await chromium.launch({ headless: !headed });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  // 打开设置
  await page.locator('[title="设置"]').first().click();
  await page.waitForTimeout(500);

  // 点击主题下拉框
  await page.locator('.settings-select-full').click();
  await page.waitForTimeout(500);

  await page.screenshot({ path: '.temp/theme-dropdown.png' });
  console.log('✓ 截图保存到 .temp/theme-dropdown.png');

  await browser.close();
})();
```

### 检查元素颜色

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

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

### 完整错误检测

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
    errors.push({ type: 'page', message: err.message });
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
      console.log('Request failed:', request.url(), failure.errorText);
    }
  });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

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
    });
  }

  await page.screenshot({ path: '.temp/screenshot.png' });

  await browser.close();
})();
```

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
await page.waitForLoadState('domcontentloaded');
await page.waitForLoadState('load');
```

### 元素定位

```javascript
// CSS 选择器
await page.locator('.class').first()
await page.locator('#id')
await page.locator('[attr="value"]')

// 文本内容
await page.getByText('text')
await page.getByText(/regex/)
await page.getByTitle('title')

// 索引
await page.locator('button').nth(0)

// 组合
await page.locator('.class').filter({ hasText: 'text' })
```

### 元素操作

```javascript
await element.click()
await element.fill(text)
await element.clear()
await element.selectOption(value)
await element.hover()
await element.focus()
```

### 获取信息

```javascript
const text = await element.innerText();
const innerHTML = await element.innerHTML();
const attr = await element.getAttribute('name');
const count = await page.locator(selector).count();
const isVisible = await element.isVisible();
```

### 事件监听

```javascript
page.on('console', msg => {});
page.on('pageerror', err => {});
page.on('requestfailed', request => {});
page.on('response', response => {});
page.on('load', () => {});
page.on('domcontentloaded', () => {});
```

### 截图

```javascript
await page.screenshot({ path: 'file.png' });
await page.screenshot({ path: 'file.png', fullPage: true });
await element.screenshot({ path: 'file.png' });
```

### 浏览器启动选项

```javascript
await chromium.launch({
  headless: false,           // 显示浏览器
  slowMo: 100,               // 慢速操作（毫秒）
  devtools: true,            // 打开开发者工具
  args: ['--start-maximized'] // 最大化窗口
});
```
