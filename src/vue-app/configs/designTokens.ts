/**
 * 设计令牌配置
 * 基于 .superdesign/config.json 中的设计系统参数
 */

/**
 * 颜色设计令牌
 */
export const colorTokens = {
  primary: '#409EFF',
  success: '#67C23A',
  warning: '#E6A23C',
  danger: '#F56C6C',
  info: '#909399',
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
