# Feng3D Editor 项目规范

## 开发规范

### 1. Git 提交信息规范

所有 Git 提交信息**必须使用中文**。

#### 提交类型 (type)

- `feat`: 新功能
- `fix`: 修复 bug
- `refactor`: 重构（既不是新增功能也不是修复 bug）
- `style`: 代码格式调整
- `docs`: 文档更新
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `perf`: 性能优化

#### 提交信息格式

```
<type>: <subject>

<body>
```

#### 示例

```
feat: 添加用户设置页面

- 添加主题切换功能
- 添加语言选择功能
```

```
fix: 修复暗色主题下按钮颜色显示错误

修复了使用暗色主题时，按钮背景颜色与背景色过于接近导致不可见的问题。
```

### 2. 代码注释规范

所有代码注释**必须使用中文**。

#### 单行注释

```javascript
// 计算两点之间的距离
function calculateDistance(p1, p2) {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}
```

#### 多行注释

```javascript
/**
 * 主题服务类
 * 负责从主题文件加载和切换 VSCode 主题
 */
class ThemeService {
  /**
   * 加载并应用指定主题
   * @param themeId 主题ID，如 'dark_modern'
   */
  async loadAndApplyTheme(themeId: string) {
    // ...
  }
}
```

#### 行内注释

```javascript
const result = data.filter(item => item.active); // 过滤出活跃的项目
```

### 3. VSCode 主题规范

- 所有颜色变量由 `ThemeService` 从 VSCode 主题文件动态加载
- 不在 CSS 中硬编码 VSCode 主题颜色
- 变量名直接对应 VSCode 的原始 key（如 `button.background` → `--button-background`）

### 4. 文件组织规范

- 临时文件统一存放在 `.temp/` 目录
- 按技能/功能名称组织子目录（如 `.temp/feng3d-browser/`）
- 文件名使用时间戳前缀便于排序

### 5. 依赖管理

- 优先使用项目已安装的依赖
- 新增依赖需说明用途
- 开发依赖使用 `npm install -D` 安装
