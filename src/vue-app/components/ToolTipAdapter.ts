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

    private tipmap = new Map<egret.DisplayObject, any>();
    private currentDisplayObject: egret.DisplayObject | null = null;

    /**
     * 注册工具提示
     * @param displayObject Egret 显示对象
     * @param tip 提示数据（通常是字符串）
     */
    register(displayObject: egret.DisplayObject, tip: any) {
        if (!displayObject) return;
        
        this.tipmap.set(displayObject, tip);
        displayObject.addEventListener(egret.MouseEvent.MOUSE_OVER, this.onMouseOver, this);
    }

    /**
     * 取消注册工具提示
     * @param displayObject Egret 显示对象
     */
    unregister(displayObject: egret.DisplayObject) {
        if (!displayObject) return;
        
        this.tipmap.delete(displayObject);
        displayObject.removeEventListener(egret.MouseEvent.MOUSE_OVER, this.onMouseOver, this);
        
        // 如果当前显示的是这个对象的提示，隐藏它
        if (this.currentDisplayObject === displayObject) {
            this.hideTooltip();
        }
    }

    private onMouseOver = (event: egret.MouseEvent) => {
        const displayObject = event.currentTarget as egret.DisplayObject;
        const tip = this.tipmap.get(displayObject);
        
        if (!tip) return;

        this.currentDisplayObject = displayObject;
        
        // 显示工具提示
        const text = String(tip);
        const x = windowEventProxy.clientX;
        const y = windowEventProxy.clientY;
        
        globalEmitter.emit('tooltip.show', { text, x, y });

        // 监听鼠标移出事件
        displayObject.addEventListener(egret.MouseEvent.MOUSE_OUT, this.onMouseOut, this);
    };

    private onMouseOut = (event: egret.MouseEvent) => {
        const displayObject = event.currentTarget as egret.DisplayObject;
        displayObject.removeEventListener(egret.MouseEvent.MOUSE_OUT, this.onMouseOut, this);
        
        this.currentDisplayObject = null;
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

