---
name: feng3d-browser
description: Browser automation for feng3d-editor project. Opens local development server, takes screenshots, tests UI, checks colors, detects runtime errors, and validates GitHub Pages deployment. Triggers: "open editor", "test UI", "screenshot editor", "check colors", "open settings", "check errors", "verify deployment", "check pages".
allowed-tools: Bash(node, npx), Read, Write, mcp__playwright__browser_*
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

1. 临时文件保存到 `.temp/feng3d-browser/` 目录（按技能名称组织）
2. 使用时间戳命名文件，便于排序和识别
3. 运行脚本生成截图或测试数据
4. 自动清理：当 `.temp/` 文件夹超过 100MB 时自动删除最早的文件

### 文件命名规范

使用 `getTempFilePath` 辅助函数生成文件路径：

```javascript
const { getTempFilePath, cleanTempFiles } = require('./.temp/temp-cleaner.js');

// 自动清理
cleanTempFiles();

// 生成文件路径（自动添加技能目录和时间戳）
const screenshotPath = getTempFilePath('feng3d-browser', 'dropdown-open', 'png');
// 结果: .temp/feng3d-browser/2026-02-06T17-53-51-dropdown-open.png
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

### 基础截图（带自动清理）

```javascript
const { chromium } = require('playwright');
const { getTempFilePath, cleanTempFiles } = require('./.temp/temp-cleaner.js');

// 自动清理
cleanTempFiles();

(async () => {
  const headed = process.env.HEADED === '1';
  const browser = await chromium.launch({ headless: !headed });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  // 使用辅助函数生成文件路径
  const screenshotPath = getTempFilePath('feng3d-browser', 'screenshot', 'png');
  await page.screenshot({ path: screenshotPath });
  console.log(`✓ 截图保存: ${screenshotPath}`);

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

### 自动清理（推荐）

在每个脚本开头添加自动清理：

```javascript
const { chromium } = require('playwright');

// 自动清理：超过100MB时删除最早的文件
const { cleanTempFiles } = require('./.temp/temp-cleaner.js');
cleanTempFiles();

(async () => {
  // ... 脚本内容
})();
```

### 手动清理

```bash
# 查看 .temp 文件夹大小
du -sh .temp/

# 运行清理脚本（自动删除最早文件）
node .temp/temp-cleaner.js

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

## GitHub Pages 部署验证

推送代码后，自动验证 GitHub Pages 部署状态。

### 验证脚本模板

```javascript
const { chromium } = require('playwright');
const { getTempFilePath, cleanTempFiles } = require('./.temp/temp-cleaner.js');

// 自动清理
cleanTempFiles();

const PAGES_URL = 'https://feng3d-labs.github.io/editor/';
const CHECK_INTERVAL = 15000; // 15秒
const MAX_CHECKS = 20; // 最多检查20次（5分钟）

(async () => {
  console.log(`🚀 开始验证部署: ${PAGES_URL}`);
  console.log(`⏱ 检查间隔: ${CHECK_INTERVAL / 1000}秒，最多检查: ${MAX_CHECKS} 次`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let deploymentSuccess = false;
  let errorCount = 0;
  let criticalErrors = [];
  const logs = [];

  // 监听控制台
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      errorCount++;
      criticalErrors.push({ type: 'console', text });
      logs.push(`❌ [Error] ${text}`);
    } else if (text.includes('已加载') || text.includes('loaded') || text.includes('success')) {
      logs.push(`✅ ${text}`);
    }
    if (text.length < 200) {
      console.log(`  [Console] ${text}`);
    }
  });

  page.on('pageerror', err => {
    errorCount++;
    criticalErrors.push({ type: 'page', message: err.message });
    logs.push(`❌ [Page Error] ${err.message}`);
  });

  // 监听请求失败
  page.on('requestfailed', request => {
    const url = request.url();
    // 忽略 favicon.ico 和一些非关键资源
    if (url.includes('favicon.ico') || url.includes('unespkg.com')) return;

    const failure = request.failure();
    if (failure && failure.errorText !== 'Aborted') {
      errorCount++;
      criticalErrors.push({
        type: 'request',
        url: url,
        status: request.resourceTimingInfo()?.responseStatus
      });
      logs.push(`❌ [404] ${url}`);
    }
  });

  // 等待1分钟后开始检查
  console.log('⏳ 等待 60 秒后开始检查...');
  await new Promise(resolve => setTimeout(resolve, 60000));

  // 定期检查
  for (let i = 0; i < MAX_CHECKS; i++) {
    try {
      console.log(`\n[${i + 1}/${MAX_CHECKS}] 检查中... (${new Date().toLocaleTimeString('zh-CN')})`);

      await page.goto(PAGES_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // 等待页面稳定
      await page.waitForTimeout(3000);

      // 检查关键元素
      const title = await page.title();
      const hasCanvas = await page.locator('canvas').count() > 0;

      // 检查关键日志
      const hasVersionLog = logs.some(l => l.includes('版本'));
      const hasIconifySuccess = logs.some(l => l.includes('已加载图标集') || l.includes('离线模式已启用'));
      const hasThemeSuccess = logs.some(l => l.includes('loaded and applied success'));
      const hasSceneInit = logs.some(l => l.includes('初始化完成') || l.includes('scene initialized'));

      // 检查是否有严重错误
      const hasCriticalErrors = criticalErrors.filter(e =>
        e.type === 'page' ||
        (e.type === 'request' && e.url && !e.url.includes('favicon.ico') && !e.url.includes('esm.sh'))
      );

      console.log(`  - 页面标题: ${title}`);
      console.log(`  - Canvas: ${hasCanvas ? '✅' : '❌'}`);
      console.log(`  - 版本日志: ${hasVersionLog ? '✅' : '❌'}`);
      console.log(`  - 图标集: ${hasIconifySuccess ? '✅' : '❌'}`);
      console.log(`  - 主题: ${hasThemeSuccess ? '✅' : '❌'}`);
      console.log(`  - 场景: ${hasSceneInit ? '✅' : '❌'}`);
      console.log(`  - 错误数: ${errorCount} (非 favicon)`);

      // 判断部署成功
      if (hasVersionLog && hasIconifySuccess && hasThemeSuccess && hasSceneInit && hasCriticalErrors.length === 0) {
        deploymentSuccess = true;
        console.log('\n✅ 部署成功！页面正常运行');

        // 截图保存
        const screenshotPath = getTempFilePath('feng3d-browser', `deployment-success-${Date.now()}`, 'png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`📸 截图保存: ${screenshotPath}`);
        break;
      }

      // 如果有严重错误，提前报告
      if (i >= 2 && hasCriticalErrors.length > 5) {
        console.log(`\n⚠️  发现 ${hasCriticalErrors.length} 个严重错误，停止检查`);
        break;
      }

    } catch (err) {
      console.log(`❌ 访问失败: ${err.message}`);
      if (i === MAX_CHECKS - 1) {
        criticalErrors.push({ type: 'navigation', error: err.message });
      }
    }

    if (i < MAX_CHECKS - 1) {
      console.log(`⏳ ${CHECK_INTERVAL / 1000}秒后再次检查...`);
      await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    }
  }

  // 输出最终报告
  console.log('\n' + '='.repeat(50));
  console.log('📊 部署验证报告');
  console.log('='.repeat(50));
  console.log(`URL: ${PAGES_URL}`);
  console.log(`状态: ${deploymentSuccess ? '✅ 成功' : '❌ 失败'}`);
  console.log(`检查次数: ${Math.min(MAX_CHECKS, 20)}`);
  console.log(`总错误数: ${errorCount}`);

  if (criticalErrors.length > 0) {
    console.log(`\n❌ 关键错误:`);
    criticalErrors.forEach((err, i) => {
      console.log(`  ${i + 1}. [${err.type}]`);
      if (err.text) console.log(`     ${err.text.substring(0, 100)}`);
      if (err.message) console.log(`     ${err.message}`);
      if (err.url) console.log(`     URL: ${err.url}`);
    });
  }

  // 保存报告
  const reportPath = getTempFilePath('feng3d-browser', 'deployment-report', 'txt');
  const fs = require('fs');
  fs.writeFileSync(reportPath, `
部署验证报告
URL: ${PAGES_URL}
时间: ${new Date().toLocaleString('zh-CN')}
状态: ${deploymentSuccess ? '✅ 成功' : '❌ 失败'}
检查次数: ${Math.min(MAX_CHECKS, 20)}
总错误数: ${errorCount}
关键错误: ${criticalErrors.length}
  `.trim());
  console.log(`\n📄 报告保存: ${reportPath}`);

  await browser.close();

  if (!deploymentSuccess) {
    process.exit(1);
  }
})();
```

### 使用示例

```bash
# 1. 推送代码
git push origin master

# 2. 运行验证脚本（会自动等待1分钟后开始检查）
node .temp/feng3d-browser/verify-deployment.js
```

### 快速检查命令

```bash
# 直接访问并检查（不等待）
node -e "
const { chromium } = require('playwright');
(async () => {
  const page = await (await chromium.launch()).newPage();
  await page.goto('https://feng3d-labs.github.io/editor/');
  console.log('页面标题:', await page.title());
  const errors = [];
  page.on('console', msg => msg.type() === 'error' && errors.push(msg.text()));
  await page.waitForTimeout(5000);
  console.log('错误数:', errors.length);
  await browser.close();
})();
"
```
