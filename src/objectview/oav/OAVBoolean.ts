import { OAVComponent, AttributeViewInfo } from 'feng3d';
import { OAVBase } from './OAVBase';

@OAVComponent()
export class OAVBoolean extends OAVBase
{
	// TODO: 迁移到 Vue 组件
	checkBox: any;

	constructor(attributeViewInfo: AttributeViewInfo)
	{
		super(attributeViewInfo);
	}

	initView()
	{
		// TODO: 迁移到 Vue 组件
		// if (this._attributeViewInfo.editable && this.checkBox)
		// {
		//     this.checkBox.addEventListener(egret.Event.CHANGE, this.onChange, this);
		// }
		// if (this.checkBox) {
		//     this.checkBox.enabled = this._attributeViewInfo.editable;
		// }
	}

	dispose()
	{
		// TODO: 迁移到 Vue 组件
		// if (this.checkBox) {
		//     this.checkBox.removeEventListener(egret.Event.CHANGE, this.onChange, this);
		// }
	}

	updateView()
	{
		// TODO: 迁移到 Vue 组件
		// if (this.checkBox) {
		//     this.checkBox.selected = this.attributeValue;
		// }
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected onChange(event: any)
	{
		// TODO: 迁移到 Vue 组件
		// if (this.checkBox) {
		//     this.attributeValue = this.checkBox.selected;
		// }
	}
}
