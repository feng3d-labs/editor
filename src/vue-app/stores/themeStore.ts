/**
 * 主题状态 Store
 * 管理应用的主题（暗色/亮色）
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * 主题类型
 */
export type ThemeType = 'dark' | 'light';

/**
 * 主题状态 Store
 */
export const useThemeStore = defineStore('theme', () => {
    // ========== 状态定义 ==========
    
    /**
     * 当前主题
     * 默认从 localStorage 读取，如果没有则使用暗色主题
     */
     const getInitialTheme = (): ThemeType => {
         if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
             // 检测系统主题偏好
             if (typeof window !== 'undefined' && window.matchMedia) {
                 const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                 return prefersDark ? 'dark' : 'light';
             }
             return 'dark';
         }
         const saved = localStorage.getItem('editor-theme');
         return (saved === 'light' || saved === 'dark') ? saved : 'dark';
     };
    
    const currentTheme = ref<ThemeType>(getInitialTheme());

    // ========== Actions ==========

    /**
     * 设置主题
     * @param theme 主题类型
     */
    function setTheme(theme: ThemeType) {
        currentTheme.value = theme;
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            localStorage.setItem('editor-theme', theme);
        }
        applyTheme(theme);
    }

    /**
     * 切换主题
     */
    function toggleTheme() {
        const newTheme: ThemeType = currentTheme.value === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }

    /**
     * 应用主题样式
     * @param theme 主题类型
     */
    function applyTheme(theme: ThemeType) {
        if (typeof document === 'undefined') {
            return;
        }
        // 更新 HTML 元素的 data-theme 属性，CSS 会根据此属性应用不同样式
        document.documentElement.setAttribute('data-theme', theme);
        
        // 更新 body 的类名，方便某些组件使用
        if (document.body) {
            document.body.className = document.body.className.replace(/theme-\w+/g, '');
            document.body.classList.add(`theme-${theme}`);
        }
    }

    // 不在 store 初始化时自动应用主题
    // 主题应用将在 main.ts 中应用挂载后手动调用

    return {
        // 状态
        currentTheme,
        
        // Actions
        setTheme,
        toggleTheme,
        applyTheme,
    };
});
