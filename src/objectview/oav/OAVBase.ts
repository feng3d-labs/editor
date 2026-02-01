import { IObjectAttributeView, AttributeViewInfo, IObjectView, IObjectBlockView, EventEmitter } from 'feng3d';
import { toolTip } from '../../ui/components/ToolTip';
import { ObjectViewEvent } from '../events/ObjectViewEvent';

/**
 * OAV 基类
 * @deprecated Egret UI 已迁移到 Vue，此类仅保留基础结构用于兼容
 */
// @ts-ignore - MixinsIObjectAttributeView 已不再扩展 eui.Component，但类型定义可能未更新
export class OAVBase extends EventEmitter implements IObjectAttributeView
{
    declare protected _space: any;
    protected _attributeName: string;
    protected _attributeType: string;
    protected _attributeViewInfo: AttributeViewInfo;
    //
    // TODO: 迁移到 Vue 组件后移除
    labelLab: any;

    /**
     * 对象属性界面
     */
    objectView: IObjectView;
    /**
     * 对象属性块界面
     */
    objectBlockView: IObjectBlockView;

    constructor(attributeViewInfo: AttributeViewInfo)
    {
        super();
        this._space = attributeViewInfo.owner;
        this._attributeName = attributeViewInfo.name;
        this._attributeType = attributeViewInfo.type;
        this._attributeViewInfo = attributeViewInfo;
    }

    get space(): any
    {
        return this._space;
    }

    set space(value: any)
    {
        this._space = value;
        this.dispose();
        this.initView();
        this.updateView();
    }

    // 占用，避免出现label命名的组件
    private label = '';

    /**
     * 初始化组件（替代 Egret 的 $onAddToStage）
     * @deprecated Egret UI 已迁移到 Vue
     */
    initComponent()
    {
        const componentParam = this._attributeViewInfo.componentParam;
        if (componentParam)
        {
            for (const key in componentParam)
            {
                if (componentParam.hasOwnProperty(key))
                {
                    this[key] = componentParam[key];
                }
            }
        }
        if (this.labelLab)
        {
            if (this.label)
                { this.labelLab.text = this.label; }
            else
                { this.labelLab.text = this._attributeName; }
        }
        if (this._attributeViewInfo.tooltip && this.labelLab)
            { toolTip.register(this.labelLab, this._attributeViewInfo.tooltip); }

        this.initView();
        this.updateView();
    }

    /**
     * 销毁组件（替代 Egret 的 $onRemoveFromStage）
     * @deprecated Egret UI 已迁移到 Vue
     */
    destroyComponent()
    {
        if (this.labelLab) {
            toolTip.unregister(this.labelLab);
        }
        this.dispose();
    }

    /**
     * 初始化
     */
    initView()
    {

    }

    /**
     * 销毁
     */
    dispose()
    {

    }

    /**
     * 更新
     */
    updateView()
    {

    }

    get attributeName(): string
    {
        return this._attributeName;
    }

    get attributeValue(): any
    {
        return this._space[this._attributeName];
    }

    set attributeValue(value: any)
    {
        if (this._space[this._attributeName] !== value)
        {
            this._space[this._attributeName] = value;
            const objectViewEvent = <any> new ObjectViewEvent(ObjectViewEvent.VALUE_CHANGE, true);
            objectViewEvent.space = this._space;
            objectViewEvent.attributeName = this._attributeName;
            objectViewEvent.attributeValue = this.attributeValue;
            this.emit('valueChange', objectViewEvent);
            // 使用 requestAnimationFrame 替代 egret.Event.ENTER_FRAME
            requestAnimationFrame(() => this.updateView());
        }
    }
}
