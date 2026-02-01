import { OAVComponent, AttributeViewInfo } from 'feng3d';
// MinMaxGradientView 已迁移到 Vue，暂时使用 any 类型
// import { MinMaxGradientView } from '../../ui/components/MinMaxGradientView';
import { OAVBase } from './OAVBase';

@OAVComponent()
export class OAVMinMaxGradient extends OAVBase
{
declare public labelLab: any;
    // TODO: 迁移到 Vue 组件
    public minMaxGradientView: any;

    constructor(attributeViewInfo: AttributeViewInfo)
    {
        super(attributeViewInfo);
    }

    initView()
    {
        // TODO: 迁移到 Vue 组件
        // if (this._attributeViewInfo.editable && this.minMaxGradientView)
        // {
        //     this.minMaxGradientView.addEventListener(egret.Event.CHANGE, this.onChange, this);
        // }
        //
        // if (this.minMaxGradientView) {
        //     this.minMaxGradientView.minMaxGradient = this.attributeValue;
        //     this.minMaxGradientView.touchEnabled = this.minMaxGradientView.touchChildren = this._attributeViewInfo.editable;
        // }
    }

    dispose()
    {
        // TODO: 迁移到 Vue 组件
        // if (this._attributeViewInfo.editable && this.minMaxGradientView)
        // {
        //     this.minMaxGradientView.removeEventListener(egret.Event.CHANGE, this.onChange, this);
        // }
    }

    updateView()
    {

    }

    private onChange()
    {

    }
}
