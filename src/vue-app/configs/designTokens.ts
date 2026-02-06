/**
 * 设计令牌配置
 * 使用 VSCode 主题语义化颜色变量
 * 变量名直接对应 VSCode 的原始颜色 key
 */

/**
 * 颜色设计令牌 - 直接使用 VSCode 语义化颜色
 * VSCode key: button.background -> CSS 变量: --button-background
 */
export const colorTokens = {
  // 按钮
  buttonBackground: 'var(--button-background)',
  buttonForeground: 'var(--button-foreground)',
  buttonHoverBackground: 'var(--button-hoverBackground)',

  // 编辑器
  editorBackground: 'var(--editor-background)',
  editorForeground: 'var(--editor-foreground)',

  // 面板
  panelBackground: 'var(--panel-background)',
  panelForeground: 'var(--panel-foreground)',

  // 侧边栏
  sideBarBackground: 'var(--sideBar-background)',
  sideBarForeground: 'var(--sideBar-foreground)',
  sideBarBorder: 'var(--sideBar-border)',

  // 输入框
  inputBackground: 'var(--input-background)',
  inputForeground: 'var(--input-foreground)',
  inputBorder: 'var(--input-border)',
  inputPlaceholderForeground: 'var(--input-placeholderForeground)',

  // 列表
  listBackground: 'var(--list-background)',
  listForeground: 'var(--list-foreground)',
  listActiveSelectionBackground: 'var(--list-activeSelectionBackground)',
  listActiveSelectionForeground: 'var(--list-activeSelectionForeground)',
  listHoverBackground: 'var(--list-hoverBackground)',

  // 边框
  editorWidgetBorder: 'var(--editorWidget-border)',

  // 状态颜色
  errorForeground: 'var(--errorForeground)',
  warningForeground: 'var(--warningForeground)',
  infoForeground: 'var(--editorInfo-foreground)',

  // 文本颜色
  foreground: 'var(--foreground)',
  descriptionForeground: 'var(--descriptionForeground)',

  // 链接
  textLinkForeground: 'var(--textLink-foreground)',

  // 标题栏
  titleBarActiveBackground: 'var(--titleBar-activeBackground)',
  titleBarActiveForeground: 'var(--titleBar-activeForeground)',

  // 选项卡
  tabActiveBackground: 'var(--tab-activeBackground)',
  tabActiveForeground: 'var(--tab-activeForeground)',
  tabInactiveBackground: 'var(--tab-inactiveBackground)',
  tabInactiveForeground: 'var(--tab-inactiveForeground)',

  // 选择区域
  editorSelectionBackground: 'var(--editor-selectionBackground)',
  editorSelectionForeground: 'var(--editor-selectionForeground)',

  // 行号
  editorLineNumberForeground: 'var(--editorLineNumber-foreground)',

  // 滚动条
  scrollbarSliderBackground: 'var(--scrollbarSlider-background)',

} as const;

/**
 * 间距设计令牌
 */
export const spacingTokens = {
  unit: 8,
  scale: [4, 8, 12, 16, 24, 32, 48, 64] as const,
} as const;

/**
 * 字体设计令牌
 */
export const typographyTokens = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontSizes: [12, 14, 16, 18, 20, 24, 28, 32] as const,
} as const;

/**
 * 获取间距值
 * @param index 间距索引（0-7）
 * @returns 间距值（px）
 */
export function getSpacing(index: number): number {
  if (index >= 0 && index < spacingTokens.scale.length) {
    return spacingTokens.scale[index];
  }
  return spacingTokens.unit;
}

/**
 * 获取字体大小
 * @param index 字体大小索引（0-7）
 * @returns 字体大小（px）
 */
export function getFontSize(index: number): number {
  if (index >= 0 && index < typographyTokens.fontSizes.length) {
    return typographyTokens.fontSizes[index];
  }
  return typographyTokens.fontSizes[1]; // 默认 14px
}
