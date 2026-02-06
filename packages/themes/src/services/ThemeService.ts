/**
 * 主题服务
 * 用于加载和应用不同的主题文件
 */

import { ThemeMapper } from './ThemeMapper';
import { VSCodeColorTheme } from '../interfaces/ThemeDefinition';

interface ThemeData extends VSCodeColorTheme {}

export interface ThemeInfo {
  id: string;
  name: string;
  fileName: string;
  description: string;
}

export class ThemeService {
  private static instance: ThemeService;
  private themes: ThemeInfo[] = [];
  private themesInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {
    // 立即开始初始化主题列表
    this.initPromise = this.initThemes();
  }

  public static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  private async initThemes() {
    try {
      // 从配置文件加载主题列表
      const response = await fetch('/resource/themes/themes.json');
      if (response.ok) {
        const config = await response.json();
        this.themes = config.themes.map((theme: any) => ({
          id: theme.id,
          name: theme.name,
          fileName: theme.fileName,
          description: theme.description
        }));
      } else {
        // 如果配置文件不可用，则使用默认主题列表
        this.themes = [
          { id: 'dark_modern', name: 'Default Dark Modern', fileName: 'dark_modern.json', description: 'Modern dark theme based on VSCode' },
          { id: 'dark_plus', name: 'Dark+', fileName: 'dark_plus.json', description: 'Dark+ theme based on VSCode' },
          { id: 'dark_vs', name: 'Dark Visual Studio', fileName: 'dark_vs.json', description: 'Dark Visual Studio theme' },
          { id: 'hc_black', name: 'High Contrast Black', fileName: 'hc_black.json', description: 'High contrast black theme' },
          { id: 'hc_light', name: 'High Contrast Light', fileName: 'hc_light.json', description: 'High contrast light theme' },
          { id: 'light_modern', name: 'Default Light Modern', fileName: 'light_modern.json', description: 'Modern light theme based on VSCode' },
          { id: 'light_plus', name: 'Light+', fileName: 'light_plus.json', description: 'Light+ theme based on VSCode' },
          { id: 'light_vs', name: 'Light Visual Studio', fileName: 'light_vs.json', description: 'Light Visual Studio theme' },
        ];
      }
    } catch (error) {
      console.error('Failed to load themes configuration:', error);
      // 出错时使用默认主题列表
      this.themes = [
        { id: 'dark_modern', name: 'Default Dark Modern', fileName: 'dark_modern.json', description: 'Modern dark theme based on VSCode' },
        { id: 'dark_plus', name: 'Dark+', fileName: 'dark_plus.json', description: 'Dark+ theme based on VSCode' },
        { id: 'dark_vs', name: 'Dark Visual Studio', fileName: 'dark_vs.json', description: 'Dark Visual Studio theme' },
        { id: 'hc_black', name: 'High Contrast Black', fileName: 'hc_black.json', description: 'High contrast black theme' },
        { id: 'hc_light', name: 'High Contrast Light', fileName: 'hc_light.json', description: 'High contrast light theme' },
        { id: 'light_modern', name: 'Default Light Modern', fileName: 'light_modern.json', description: 'Modern light theme based on VSCode' },
        { id: 'light_plus', name: 'Light+', fileName: 'light_plus.json', description: 'Light+ theme based on VSCode' },
        { id: 'light_vs', name: 'Light Visual Studio', fileName: 'light_vs.json', description: 'Light Visual Studio theme' },
      ];
    } finally {
      this.themesInitialized = true;
    }
  }

  /**
   * 等待主题列表初始化完成
   */
  public async waitForInitialization(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  /**
   * 获取所有可用主题
   */
  public getThemes(): ThemeInfo[] {
    return this.themes;
  }

  /**
   * 获取主题详情
   */
  public getThemeInfo(themeId: string): ThemeInfo | undefined {
    return this.themes.find(theme => theme.id === themeId);
  }

  /**
   * 加载并应用主题
   */
  public async loadAndApplyTheme(themeId: string): Promise<void> {
    try {
      // 获取主题文件路径
      const themeInfo = this.getThemeInfo(themeId);
      if (!themeInfo) {
        throw new Error(`Theme ${themeId} not found`);
      }

      // 加载主题文件（处理 include 字段）
      const themeData = await this.loadThemeFile(themeInfo.fileName);
      
      // 映射 VSCode 主题到 CSS 变量
      const mappedTheme = ThemeMapper.mapVSCodeToCSSVariables(themeData);
      
      // 应用映射后的主题
      this.applyMappedTheme(mappedTheme, themeId);
      
      console.log(`Theme ${themeId} loaded and applied successfully`);
    } catch (error) {
      console.error(`Failed to load and apply theme ${themeId}:`, error);
      throw error;
    }
  }

  /**
   * 加载主题文件（支持 include 字段）
   */
  private async loadThemeFile(fileName: string, basePath: string = '/resource/themes/'): Promise<ThemeData> {
    // 构建主题文件URL
    const themeUrl = basePath + fileName;
    
    try {
      const response = await fetch(themeUrl);
      if (!response.ok) {
        throw new Error(`Failed to load theme file: ${themeUrl}`);
      }
      
      const themeData: ThemeData = await response.json();
      
      // 如果主题文件包含 include 字段，需要先加载被继承的主题
      if (themeData.include) {
        // 处理相对路径
        const includePath = this.resolveIncludePath(themeData.include, themeUrl);
        const parentTheme = await this.loadThemeFile(includePath, '/');
        
        // 合并颜色：父主题为基础，当前主题覆盖
        const mergedColors = { ...parentTheme.colors, ...themeData.colors };
        
        // 返回合并后的主题数据
        return {
          ...parentTheme, // 继承父主题的基本信息
          ...themeData,   // 当前主题的信息覆盖父主题
          colors: mergedColors // 合并后的颜色
        };
      }
      
      return themeData;
    } catch (error) {
      console.error(`Error loading theme file ${fileName}:`, error);
      throw error;
    }
  }
  
  /**
   * 解析 include 路径
   */
  private resolveIncludePath(includePath: string, currentThemeUrl: string): string {
    if (includePath.startsWith('./') || includePath.startsWith('../')) {
      // 处理相对路径
      const currentDir = currentThemeUrl.substring(0, currentThemeUrl.lastIndexOf('/') + 1);
      const resolvedPath = new URL(includePath, currentDir).pathname;
      return resolvedPath.split('/').pop() || includePath; // 只返回文件名
    }
    return includePath;
  }

  /**
   * 应用映射后的主题到CSS变量
   */
  private applyMappedTheme(mappedTheme: Record<string, string>, themeId: string): void {
    const root = document.documentElement;
    
    // 清除之前的主题变量
    this.clearThemeVariables(root);
    
    // 根据主题类型设置 data-theme 属性
    if (themeId.includes('light') || themeId.includes('hc_light')) {
      root.setAttribute('data-theme', 'light');
    } else {
      root.setAttribute('data-theme', 'dark');
    }
    
    // 应用映射后的主题变量
    Object.entries(mappedTheme).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(key, value);
      }
    });
  }

  /**
   * 清除主题变量
   */
  private clearThemeVariables(root: HTMLElement): void {
    // 获取所有CSS变量
    const computedStyles = getComputedStyle(root);
    const cssVars: string[] = [];

    // 收集所有CSS变量
    for (let i = 0; i < computedStyles.length; i++) {
      const property = computedStyles[i];
      if (property.startsWith('--')) {
        cssVars.push(property);
      }
    }

    // 清除我们的主题相关变量
    cssVars.forEach(varName => {
      if (varName.startsWith('--color-') || varName.startsWith('--el-')) {
        root.style.removeProperty(varName);
      }
    });
  }

  /**
   * 获取当前应用的主题ID
   */
  public getCurrentThemeId(): string | null {
    // 首先尝试从本地存储获取
    const savedThemeId = localStorage.getItem('editor-vscode-theme');
    if (savedThemeId) {
      return savedThemeId;
    }
    return null;
  }
}