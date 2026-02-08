---
name: feng3d-dev
description: Feng3D Editor 开发技能 - 包含浏览器自动化测试、Bug修复流程、代码规范等。Triggers: "测试", "bug", "修复", "不显示", "错误", "失败", "问题", "screenshot", "验证"
allowed-tools: Bash(*), Read, Write, Edit, Glob, Grep, AskUserQuestion, TodoWrite, Task, TaskOutput, TaskStop, Skill, ExitPlanMode, NotebookEdit, EnterPlanMode, WebSearch, mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot, mcp__playwright__browser_take_screenshot, mcp__playwright__browser_click, mcp__playwright__browser_type, mcp__playwright__browser_evaluate, mcp__playwright__browser_close, mcp__zai-mcp-server__diagnose_error_screenshot, mcp__zai-mcp-server__extract_text_from_screenshot, mcp__zai-mcp-server__ui_to_artifact, mcp__web_reader__webReader, mcp__4_5v_mcp__analyze_image, mcp__zread__get_repo_structure, mcp__zread__read_file, mcp__zread__search_doc, mcp__web-search-prime__webSearchPrime
---

# Feng3D Editor 开发技能

> **最重要: 用户的明确指令永远优先于任何流程！**

## 紧急停止条件（最高优先级）

当用户发出以下任何指令时，**立即停止当前所有操作**：
- "提交代码"
- "够了"
- "不要修改了"
- "停手"
- "先这样"
- "不要胡乱修改"
- "还原"
- 任何形式的拒绝/否定语言

**违反此规则是严重错误，必须绝对避免。**

---

## 目录

1. [浏览器自动化测试](#浏览器自动化测试)
2. [Bug 修复流程](#bug-修复流程)
3. [GitHub Issues 修复流程](#github-issues-修复流程)
4. [开发规范](#开发规范)

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

## GitHub Issues 修复流程

### 完整流程

```
获取 Issue → 创建分支 → 修复 Bug → 提交代码 → 推送分支 → 创建 PR → 评论交互 → 合并 → 清理
```

### 1. 获取 Issue 内容

使用 `mcp__web_reader__webReader` 访问 GitHub issue URL：

```javascript
// 读取 issue 内容，理解问题描述
webReader('https://github.com/feng3d-labs/editor/issues/45');
```

### 2. 创建分支

分支命名规范：`fix/issue-{编号}` 或 `feature/issue-{编号}`

```bash
git checkout -b fix/issue-45
```

### 3. 修复 Bug

按照 [Bug 修复流程](#bug-修复流程) 进行：
- **理解 → 还原 → 最小改 → 一次验 → 精简 → 停手**

### 4. 提交代码

```bash
git add .
git commit -m "fix: #45 旋转工具显示位置不正确"
```

提交信息格式：
- `fix: #编号 简短描述`
- `feat: #编号 简短描述`
- `docs: #编号 简短描述`

### 5. 推送分支

```bash
git push -u origin fix/issue-45
```

### 6. 创建 Pull Request

使用 `gh pr create` 命令：

```bash
gh pr create \
  --title "fix: #45 旋转工具显示位置不正确" \
  --body "## 问题描述
旋转工具被遮住，位置需要向下移动，上边对齐工具栏底部

## 修复方案
调整 CSS 定位，使旋转工具向下移动到正确位置

## 测试
- [ ] 本地验证通过
- [ ] 工具不被遮住
- [ ] 上边对齐工具栏底部"
```

### 7. 评论与交互

**回复 Issue**（告知已提交 PR）：
```bash
gh issue comment 45 --body "已提交 PR #xxx，请查阅"
```

**响应 Review 反馈**：
- 根据 review 评论修改代码
- 修改后再次推送，PR 自动更新

### 8. 合并 PR

- 等待 review 通过
- 使用 `gh pr merge` 或在 GitHub 网页上合并
- 合并方式选择：`merge`、`squash` 或 `rebase`

```bash
# 通过命令行合并
gh pr merge --squash
```

### 9. 清理

```bash
git checkout master
git pull
git branch -d fix/issue-45  # 删除本地分支
git push origin --delete fix/issue-45  # 删除远程分支（可选）
```

### 注意事项

1. **创建 PR 前确保**：
   - 代码已通过本地测试
   - 提交信息清晰规范
   - PR 描述包含问题、方案、测试清单

2. **等待合并**：
   - 不要催促合并
   - 及时响应 review 意见
   - 修改后推送即可，无需新建 PR

3. **紧急停止条件**同样适用于此流程
   - 用户说"提交代码"时立即提交当前修改
   - 用户说"够了/先这样"时停止操作

---

## 开发规范

### 绝对禁止事项（严重错误）

- ❌❌❌ 用户说"提交代码"后继续修改代码
- ❌❌❌ 用户明确表示"够了/不要修改"后仍继续操作
- ❌ 添加调试日志后没有及时清理
- ❌ 修改已工作的代码
- ❌ 反复刷新验证（触发热重载）
- ❌ 过度修改引入新问题
- ❌ 自作主张继续操作

### 允许的操作

- ✅ 用户明确要求修改代码时
- ✅ 用户报告 bug 时按照流程修复
- ✅ 用户要求添加新功能时

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
