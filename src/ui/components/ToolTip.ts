import { windowEventProxy } from 'feng3d';
import { editorui } from '../../global/editorui';
import { TipString } from './tipviews/TipString';

export interface ITipView extends egret.DisplayObject
{
    value: any;
}

/**
 * ToolTip 类
 * @deprecated 请使用 Vue ToolTip 组件，此类作为过渡层
 */
export class ToolTip
{
    private adapter: any;

    constructor() {
        // 延迟加载适配器，避免循环依赖
        this.loadAdapter();
    }

    private async loadAdapter() {
        try {
            const { createToolTipAdapter } = await import('../../vue-app/components/ToolTipAdapter');
            this.adapter = createToolTipAdapter();
        } catch (error) {
            console.warn('ToolTip adapter not available, using fallback', error);
            // 如果适配器不可用，使用旧的实现作为后备
            this.adapter = new LegacyToolTip();
        }
    }

    /**
     * 默认 提示界面
     * @deprecated Vue 版本暂不支持自定义视图
     */
    get defaultTipview() {
        return this.adapter?.defaultTipview || (() => TipString);
    }

    set defaultTipview(value: () => any) {
        if (this.adapter) {
            this.adapter.defaultTipview = value;
        }
    }

    /**
     * tip界面映射表
     * @deprecated Vue 版本暂不支持自定义视图
     */
    get tipviewmap() {
        return this.adapter?.tipviewmap || new Map();
    }

    register(displayObject: egret.DisplayObject, tip: any)
    {
        if (!this.adapter) {
            // 如果适配器还没加载，延迟执行
            this.loadAdapter().then(() => {
                this.adapter?.register(displayObject, tip);
            });
            return;
        }
        this.adapter.register(displayObject, tip);
    }

    unregister(displayObject: egret.DisplayObject)
    {
        if (!this.adapter) return;
        this.adapter.unregister(displayObject);
    }
}

/**
 * 旧版 ToolTip 实现（作为后备）
 */
class LegacyToolTip
{
    defaultTipview = () => TipString;
    tipviewmap = new Map<any, new () => ITipView>();

    private tipmap = new Map<egret.DisplayObject, any>();
    private tipView: ITipView;

    register(displayObject: egret.DisplayObject, tip: any)
    {
        if (!displayObject) return;
        this.tipmap.set(displayObject, tip);
        displayObject.addEventListener(egret.MouseEvent.MOUSE_OVER, this.onMouseOver, this);
    }

    unregister(displayObject: egret.DisplayObject)
    {
        if (!displayObject) return;
        this.tipmap.delete(displayObject);
        displayObject.removeEventListener(egret.MouseEvent.MOUSE_OVER, this.onMouseOver, this);
    }

    private onMouseOver = (event: egret.MouseEvent) => {
        this.removeTipview();

        const displayObject = event.currentTarget;
        const tip = this.tipmap.get(displayObject);
        let TipviewCls = this.tipviewmap.get(tip.constructor);
        if (!TipviewCls)
        {
            TipviewCls = this.defaultTipview();
        }

        this.tipView = new TipviewCls();
        editorui.tooltipLayer.addChild(this.tipView);
        this.tipView.value = tip;
        this.tipView.x = windowEventProxy.clientX;
        this.tipView.y = windowEventProxy.clientY - this.tipView.height;

        displayObject.addEventListener(egret.MouseEvent.MOUSE_OUT, this.onMouseOut, this);
    };

    private onMouseOut = (event: egret.MouseEvent) => {
        const displayObject = event.currentTarget;
        displayObject.removeEventListener(egret.MouseEvent.MOUSE_OUT, this.onMouseOut, this);
        this.removeTipview();
    };

    private removeTipview()
    {
        if (this.tipView)
        {
            this.tipView.parent.removeChild(this.tipView);
            this.tipView = null;
        }
    }
}

export const toolTip = new ToolTip();
