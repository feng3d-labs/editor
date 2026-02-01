import { OAVComponent, AttributeViewInfo } from 'feng3d';
// MinMaxCurveView 已迁移到 Vue，暂时使用 any 类型
// import { MinMaxCurveView } from '../../ui/components/MinMaxCurveView';
import { OAVBase } from './OAVBase';

@OAVComponent()
export class OAVMinMaxCurve extends OAVBase
{
declare public labelLab: any;
    // TODO: 迁移到 Vue 组件
    public minMaxCurveView: any;

    constructor(attributeViewInfo: AttributeViewInfo)
    {
        super(attributeViewInfo);
    }

    initView()
    {
        // TODO: 迁移到 Vue 组件
        // if (this._attributeViewInfo.editable && this.minMaxCurveView)
        // {
        //     this.minMaxCurveView.addEventListener(egret.Event.CHANGE, this.onChange, this);
        // }
        //
        // if (this.minMaxCurveView) {
        //     this.minMaxCurveView.minMaxCurve = this.attributeValue;
        //     this.minMaxCurveView.touchEnabled = this.minMaxCurveView.touchChildren = this._attributeViewInfo.editable;
        // }
    }

    dispose()
    {
        // TODO: 迁移到 Vue 组件
        // if (this._attributeViewInfo.editable && this.minMaxCurveView)
        // {
        //     this.minMaxCurveView.removeEventListener(egret.Event.CHANGE, this.onChange, this);
        // }
    }

    updateView()
    {

    }

    private onChange()
    {

    }
}
