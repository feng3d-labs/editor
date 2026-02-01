/**
 * ToolTip 组件适配器
 * 用于在 Vue 组件挂载前提供向后兼容的接口
 * 一旦所有代码都迁移到直接使用 Vue 组件，可以删除此文件
 */
import { windowEventProxy, globalEmitter } from 'feng3d';

/**
 * ToolTip 适配器类
 * 提供与旧 ToolTip 类兼容的接口
 * @deprecated 请直接使用 Vue ToolTip 组件，此适配器仅用于过渡期
 */
export class ToolTipAdapter {
    /**
     * tip界面映射表，{key:数据类定义,value:界面类定义}
     * 注意：Vue 版本目前只支持字符串提示，自定义视图类型暂不支持
     */
    tipviewmap = new Map<any, new () => any>();

    /**
     * 默认提示界面
     * 注意：Vue 版本目前只支持字符串提示
     */
    defaultTipview = () => null;

    private tipmap = new Map<HTMLElement, any>();
    private currentElement: HTMLElement | null = null;

    /**
     * 注册工具提示
     * @param element DOM 元素
     * @param tip 提示数据（通常是字符串）
     */
    register(element: any, tip: any) {
        if (!element) return;
        
        // 如果是 DOM 元素，直接使用；否则尝试获取 DOM
        const domElement = element instanceof HTMLElement ? element : (element as any)?.dom || element;
        if (!(domElement instanceof HTMLElement)) {
            console.warn('ToolTipAdapter: element is not a DOM element', element);
            return;
        }
        
        this.tipmap.set(domElement, tip);
        domElement.addEventListener('mouseenter', this.onMouseOver);
        domElement.addEventListener('mouseleave', this.onMouseOut);
    }

    /**
     * 取消注册工具提示
     * @param element DOM 元素
     */
    unregister(element: any) {
        if (!element) return;
        
        const domElement = element instanceof HTMLElement ? element : (element as any)?.dom || element;
        if (!(domElement instanceof HTMLElement)) return;
        
        this.tipmap.delete(domElement);
        domElement.removeEventListener('mouseenter', this.onMouseOver);
        domElement.removeEventListener('mouseleave', this.onMouseOut);
        
        // 如果当前显示的是这个元素的提示，隐藏它
        if (this.currentElement === domElement) {
            this.hideTooltip();
        }
    }

    private onMouseOver = (event: MouseEvent) => {
        const element = event.currentTarget as HTMLElement;
        const tip = this.tipmap.get(element);
        
        if (!tip) return;

        this.currentElement = element;
        
        // 显示工具提示
        const text = String(tip);
        const x = windowEventProxy.clientX;
        const y = windowEventProxy.clientY;
        
        globalEmitter.emit('tooltip.show', { text, x, y });
    };

    private onMouseOut = (event: MouseEvent) => {
        this.currentElement = null;
        this.hideTooltip();
    };

    private hideTooltip() {
        globalEmitter.emit('tooltip.hide');
    }
}

/**
 * 创建 ToolTip 适配器实例
 * @deprecated 请直接使用 Vue ToolTip 组件
 */
export function createToolTipAdapter(): ToolTipAdapter {
    return new ToolTipAdapter();
}

