/**
 * Egret 组件使用的 i18n 工具函数
 * 提供响应式的翻译功能，适用于 Egret UI 组件
 */
import { t, onLanguageChange, getCurrentLanguage } from '../i18n';

/**
 * 获取翻译文本（用于 Egret 组件）
 * @param key 翻译键
 * @param params 参数对象
 * @param defaultText 默认文本
 * @returns 翻译后的文本
 */
export function getText(key: string, params?: Record<string, string | number>, defaultText?: string): string {
    return t(key, params, defaultText);
}

/**
 * 创建响应式文本更新函数（用于 Egret Label 等组件）
 * @param key 翻译键
 * @param params 参数对象（可选，可以是函数以支持动态参数）
 * @param defaultText 默认文本
 * @returns 更新函数，调用时会更新文本
 */
export function createReactiveText(
    key: string,
    params?: Record<string, string | number> | (() => Record<string, string | number>),
    defaultText?: string
): {
    /**
     * 获取当前翻译文本
     */
    getText: () => string;
    /**
     * 更新文本到指定的 Label
     * @param label Label 组件
     */
    updateLabel: (label: eui.Label) => void;
    /**
     * 销毁监听器
     */
    dispose: () => void;
} {
    let label: eui.Label | null = null;
    let disposed = false;

    const updateText = () => {
        if (disposed) return;
        
        const actualParams = typeof params === 'function' ? params() : params;
        const text = t(key, actualParams, defaultText);
        
        if (label) {
            label.text = text;
        }
    };

    // 监听语言变更
    const disposeLanguageChange = onLanguageChange(() => {
        updateText();
    });

    // 初始更新
    updateText();

    return {
        getText: () => {
            const actualParams = typeof params === 'function' ? params() : params;
            return t(key, actualParams, defaultText);
        },
        updateLabel: (targetLabel: eui.Label) => {
            label = targetLabel;
            updateText();
        },
        dispose: () => {
            disposed = true;
            disposeLanguageChange();
            label = null;
        },
    };
}
