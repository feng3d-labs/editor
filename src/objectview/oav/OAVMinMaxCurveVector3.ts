import { OAVComponent, AttributeViewInfo } from 'feng3d';
// MinMaxCurveVector3View 已迁移到 Vue，暂时使用 any 类型
// import { MinMaxCurveVector3View } from '../../ui/components/MinMaxCurveVector3View';
import { OAVBase } from './OAVBase';

@OAVComponent()
export class OAVMinMaxCurveVector3 extends OAVBase
{
declare public labelLab: any;
    // TODO: 迁移到 Vue 组件
    public minMaxCurveVector3View: any;

    constructor(attributeViewInfo: AttributeViewInfo)
    {
        super(attributeViewInfo);
    }

    initView()
    {
        // TODO: 迁移到 Vue 组件
        // if (this._attributeViewInfo.editable && this.minMaxCurveVector3View)
        // {
        //     this.minMaxCurveVector3View.addEventListener(egret.Event.CHANGE, this.onChange, this);
        // }
        //
        // if (this.minMaxCurveVector3View) {
        //     this.minMaxCurveVector3View.minMaxCurveVector3 = this.attributeValue;
        //     this.minMaxCurveVector3View.touchEnabled = this.minMaxCurveVector3View.touchChildren = this._attributeViewInfo.editable;
        // }
    }

    dispose()
    {
        // TODO: 迁移到 Vue 组件
        // if (this._attributeViewInfo.editable && this.minMaxCurveVector3View)
        // {
        //     this.minMaxCurveVector3View.removeEventListener(egret.Event.CHANGE, this.onChange, this);
        // }
    }

    updateView()
    {

    }

    private onChange()
    {

    }
}
