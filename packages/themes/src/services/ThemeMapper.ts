/**
 * 主题映射服务
 * 将 VSCode 主题颜色映射到我们的设计系统变量
 */

import { VSCodeColorTheme } from '../interfaces/ThemeDefinition';

interface VSCodeTheme extends VSCodeColorTheme {}

export class ThemeMapper {
  /**
   * 将 VSCode 主题颜色映射到设计系统变量
   */
  public static mapVSCodeToDesignSystem(vscodeTheme: VSCodeTheme): Record<string, string> {
    const mappedVariables: Record<string, string> = {};
    const colors = vscodeTheme.colors as Record<string, string>;
    
    // 映射主色调
    const accentColor = colors['activityBar.activeBorder'] || 
                       colors['button.background'] || 
                       '#0078D4'; // 默认使用 VSCode 的蓝色
    mappedVariables['--color-primary-600'] = accentColor || '#0078D4';
    
    // 从主色调生成色阶
    mappedVariables['--color-primary-50'] = this.lightenColor(mappedVariables['--color-primary-600'], 0.9);
    mappedVariables['--color-primary-100'] = this.lightenColor(mappedVariables['--color-primary-600'], 0.8);
    mappedVariables['--color-primary-200'] = this.lightenColor(mappedVariables['--color-primary-600'], 0.7);
    mappedVariables['--color-primary-300'] = this.lightenColor(mappedVariables['--color-primary-600'], 0.6);
    mappedVariables['--color-primary-400'] = this.lightenColor(mappedVariables['--color-primary-600'], 0.4);
    mappedVariables['--color-primary-500'] = this.lightenColor(mappedVariables['--color-primary-600'], 0.2);
    mappedVariables['--color-primary-700'] = this.darkenColor(mappedVariables['--color-primary-600'], 0.2);
    mappedVariables['--color-primary-800'] = this.darkenColor(mappedVariables['--color-primary-600'], 0.4);
    mappedVariables['--color-primary-900'] = this.darkenColor(mappedVariables['--color-primary-600'], 0.6);
    
    // 映射编辑器背景
    mappedVariables['--color-editor-bg'] = (colors['editor.background'] || 
                                          colors['activityBar.background'] || 
                                          '#1F1F1F');
    
    // 映射面板背景
    mappedVariables['--color-panel-bg'] = (colors['sideBar.background'] || 
                                         colors['editorWidget.background'] || 
                                         '#181818');
    
    // 映射工具栏背景
    mappedVariables['--color-toolbar-bg'] = (colors['titleBar.activeBackground'] || 
                                           colors['activityBar.background'] || 
                                           '#181818');
    
    // 映射边框颜色
    mappedVariables['--color-border'] = (colors['sideBar.border'] || 
                                       colors['tab.border'] || 
                                       '#2B2B2B');
    
    // 映射主要文字颜色
    mappedVariables['--color-text-primary'] = (colors['editor.foreground'] || 
                                             colors['foreground'] || 
                                             '#CCCCCC');
    
    // 映射次要文字颜色
    mappedVariables['--color-text-secondary'] = (colors['sideBarSectionHeader.foreground'] || 
                                               colors['descriptionForeground'] || 
                                               '#9D9D9D');
    
    // 映射第三等级文字颜色
    mappedVariables['--color-text-tertiary'] = (colors['activityBar.inactiveForeground'] || 
                                              '#868686');
    
    // 映射成功颜色
    mappedVariables['--color-success-500'] = (colors['editorGutter.addedBackground'] || 
                                            '#2EA043');
    
    // 映射警告颜色
    const warningColor = (colors as any)['notificationsWarningIcon.foreground'] || '#dcb100';
    mappedVariables['--color-warning-500'] = warningColor;
    
    // 映射危险/错误颜色
    mappedVariables['--color-danger-500'] = (colors['editorGutter.deletedBackground'] || 
                                           colors['errorForeground'] || 
                                           '#F85149');
    
    // 映射信息颜色
    mappedVariables['--color-info-500'] = (colors['textLink.foreground'] || 
                                         '#4daafc');
    
    // 映射灰度色板 (基于 VSCode 的灰度)
    mappedVariables['--color-gray-50'] = this.lightenColor(mappedVariables['--color-editor-bg'], 0.95);
    mappedVariables['--color-gray-100'] = this.lightenColor(mappedVariables['--color-editor-bg'], 0.85);
    mappedVariables['--color-gray-200'] = this.lightenColor(mappedVariables['--color-editor-bg'], 0.75);
    mappedVariables['--color-gray-300'] = this.lightenColor(mappedVariables['--color-editor-bg'], 0.65);
    mappedVariables['--color-gray-400'] = this.lightenColor(mappedVariables['--color-editor-bg'], 0.55);
    mappedVariables['--color-gray-500'] = this.lightenColor(mappedVariables['--color-editor-bg'], 0.45);
    mappedVariables['--color-gray-600'] = this.lightenColor(mappedVariables['--color-editor-bg'], 0.35);
    mappedVariables['--color-gray-700'] = this.lightenColor(mappedVariables['--color-editor-bg'], 0.25);
    mappedVariables['--color-gray-800'] = this.lightenColor(mappedVariables['--color-editor-bg'], 0.15);
    mappedVariables['--color-gray-900'] = mappedVariables['--color-editor-bg'];
    
    // 映射组件状态颜色
    mappedVariables['--color-hover'] = this.adjustAlpha(mappedVariables['--color-primary-600'], 0.1);
    mappedVariables['--color-active'] = this.adjustAlpha(mappedVariables['--color-primary-600'], 0.2);
    mappedVariables['--color-focus'] = this.adjustAlpha(mappedVariables['--color-primary-600'], 0.3);
    
    // 映射到 Element Plus 变量
    mappedVariables['--el-color-primary'] = mappedVariables['--color-primary-600'];
    mappedVariables['--el-color-primary-light-3'] = mappedVariables['--color-primary-500'];
    mappedVariables['--el-color-primary-light-5'] = mappedVariables['--color-primary-400'];
    mappedVariables['--el-color-primary-light-7'] = mappedVariables['--color-primary-300'];
    mappedVariables['--el-color-primary-light-8'] = mappedVariables['--color-primary-200'];
    mappedVariables['--el-color-primary-light-9'] = mappedVariables['--color-primary-100'];
    mappedVariables['--el-color-primary-dark-2'] = mappedVariables['--color-primary-700'];
    
    mappedVariables['--el-bg-color'] = mappedVariables['--color-editor-bg'];
    mappedVariables['--el-bg-color-overlay'] = mappedVariables['--color-panel-bg'];
    
    mappedVariables['--el-text-color-primary'] = mappedVariables['--color-text-primary'];
    mappedVariables['--el-text-color-regular'] = mappedVariables['--color-text-secondary'];
    mappedVariables['--el-text-color-secondary'] = mappedVariables['--color-text-tertiary'];
    mappedVariables['--el-text-color-placeholder'] = mappedVariables['--color-gray-400'];
    mappedVariables['--el-text-color-disabled'] = mappedVariables['--color-gray-500'];
    
    mappedVariables['--el-border-color'] = mappedVariables['--color-border'];
    mappedVariables['--el-border-color-light'] = mappedVariables['--color-gray-700'];
    mappedVariables['--el-border-color-lighter'] = mappedVariables['--color-gray-800'];
    mappedVariables['--el-border-color-extra-light'] = mappedVariables['--color-gray-800'];
    mappedVariables['--el-border-color-dark'] = mappedVariables['--color-gray-500'];
    mappedVariables['--el-border-color-darker'] = mappedVariables['--color-gray-400'];
    
    mappedVariables['--el-fill-color'] = mappedVariables['--color-gray-700'];
    mappedVariables['--el-fill-color-light'] = mappedVariables['--color-gray-800'];
    mappedVariables['--el-fill-color-lighter'] = mappedVariables['--color-gray-800'];
    mappedVariables['--el-fill-color-extra-light'] = mappedVariables['--color-gray-900'];
    mappedVariables['--el-fill-color-dark'] = mappedVariables['--color-gray-600'];
    mappedVariables['--el-fill-color-darker'] = mappedVariables['--color-gray-500'];
    
    mappedVariables['--el-color-success'] = mappedVariables['--color-success-500'];
    mappedVariables['--el-color-warning'] = mappedVariables['--color-warning-500'];
    mappedVariables['--el-color-danger'] = mappedVariables['--color-danger-500'];
    mappedVariables['--el-color-info'] = mappedVariables['--color-info-500'];

    return mappedVariables;
  }

  /**
   * 提取 HSL 值，如果存在
   */
  private static extractHSLFromTheme(theme: VSCodeTheme, key: string, fallback: string): string | null {
    const color = (theme.colors as Record<string, string>)[key];
    if (color) {
      return color;
    }
    return null;
  }

  /**
   * 调整颜色亮度
   */
  private static lightenColor(color: string, factor: number): string {
    const normalizedColor = this.normalizeColor(color);
    if (!normalizedColor) return color;
    
    const [r, g, b] = normalizedColor;
    
    // 调整亮度
    const newR = Math.min(255, r + (255 - r) * factor);
    const newG = Math.min(255, g + (255 - g) * factor);
    const newB = Math.min(255, b + (255 - b) * factor);
    
    return `rgb(${Math.round(newR)}, ${Math.round(newG)}, ${Math.round(newB)})`;
  }

  /**
   * 调整颜色暗度
   */
  private static darkenColor(color: string, factor: number): string {
    const normalizedColor = this.normalizeColor(color);
    if (!normalizedColor) return color;
    
    const [r, g, b] = normalizedColor;
    
    // 调整暗度
    const newR = Math.max(0, r - r * factor);
    const newG = Math.max(0, g - g * factor);
    const newB = Math.max(0, b - b * factor);
    
    return `rgb(${Math.round(newR)}, ${Math.round(newG)}, ${Math.round(newB)})`;
  }

  /**
   * 调整颜色透明度
   */
  private static adjustAlpha(color: string, alpha: number): string {
    const normalizedColor = this.normalizeColor(color);
    if (!normalizedColor) {
      // 如果颜色已经是带alpha的，直接修改alpha值
      if (color.includes('rgba') || color.includes('hsla')) {
        const colorParts = color.match(/[\d.]+/g);
        if (colorParts && colorParts.length >= 4) {
          return `rgba(${colorParts[0]}, ${colorParts[1]}, ${colorParts[2]}, ${alpha})`;
        }
      }
      // 如果颜色是hex格式，转换为rgba
      if (color.startsWith('#')) {
        const [r, g, b] = this.hexToRgb(color);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
      return color;
    }
    
    const [r, g, b] = normalizedColor;
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
  }

  /**
   * 标准化颜色格式为 RGB 数组
   */
  private static normalizeColor(color: string): [number, number, number] | null {
    // 处理十六进制颜色
    if (color.startsWith('#')) {
      return this.hexToRgb(color);
    }
    
    // 处理 rgb/rgba 颜色
    if (color.startsWith('rgb')) {
      const match = color.match(/\d+/g);
      if (match && match.length >= 3) {
        return [parseInt(match[0]), parseInt(match[1]), parseInt(match[2])];
      }
    }
    
    // 处理 hsl/hsla 颜色
    if (color.startsWith('hsl')) {
      const match = color.match(/[\d.]+/g);
      if (match && match.length >= 3) {
        const [h, s, l] = match.map(Number);
        return this.hslToRgb(h, s / 100, l / 100);
      }
    }
    
    return null;
  }

  /**
   * 十六进制颜色转 RGB
   */
  private static hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0]; // 默认黑色
  }

  /**
   * HSL 转 RGB
   */
  private static hslToRgb(h: number, s: number, l: number): [number, number, number] {
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h / 360 + 1/3);
      g = hue2rgb(p, q, h / 360);
      b = hue2rgb(p, q, h / 360 - 1/3);
    }

    return [
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255)
    ];
  }
}