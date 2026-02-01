import { OAVComponent, AttributeViewInfo } from 'feng3d';
// ComboBox 已迁移到 Vue，暂时使用 any 类型
// import { ComboBox } from '../../ui/components/ComboBox';
import { OAVBase } from './OAVBase';

@OAVComponent()
export class OAVEnum extends OAVBase
{
declare public labelLab: any;
    // TODO: 迁移到 Vue 组件
    public combobox: any;

    private list: { label: string, value: number }[];

    constructor(attributeViewInfo: AttributeViewInfo)
    {
        super(attributeViewInfo);
    }

    // eslint-disable-next-line accessor-pairs
    set enumClass(obj)
    {
        this.list = [];
        for (const key in obj)
        {
            if (obj.hasOwnProperty(key))
            {
                if (isNaN(Number(key)))
                { this.list.push({ label: key, value: obj[key] }); }
            }
        }
    }

    initView()
    {
        // TODO: 迁移到 Vue 组件
        // if (this._attributeViewInfo.editable && this.combobox)
        // {
        //     this.combobox.addEventListener(egret.Event.CHANGE, this.onComboxChange, this);
        // }
        // if (this.combobox) {
        //     this.combobox.touchEnabled = this.combobox.touchChildren = this._attributeViewInfo.editable;
        // }
    }

    dispose()
    {
        // TODO: 迁移到 Vue 组件
        // if (this.combobox) {
        //     this.combobox.removeEventListener(egret.Event.CHANGE, this.onComboxChange, this);
        // }
    }

    updateView()
    {
        // TODO: 迁移到 Vue 组件
        // if (this.combobox) {
        //     this.combobox.dataProvider = this.list;
        //     if (this.list)
        //     {
        //         this.combobox.data = this.list.reduce((prevalue, item) =>
        //         {
        //             if (prevalue) return prevalue;
        //             if (item.value === this.attributeValue)
        //             {
        //                 return item;
        //             }
        //
        //             return null;
        //         }, null);
        //     }
        // }
    }

    private onComboxChange()
    {
        // TODO: 迁移到 Vue 组件
        // if (this.combobox?.data) {
        //     this.attributeValue = this.combobox.data.value;
        // }
    }
}
