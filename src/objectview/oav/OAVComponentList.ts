import { AttributeViewInfo, Component, Components, GameObject, HideFlags, IEvent, OAVComponent } from 'feng3d';
import { menuConfig } from '../../configs/CommonConfig';
import { ComponentView } from '../../ui/components/ComponentView';
import { menu } from '../../ui/components/Menu';
import { drag } from '../../ui/drag/Drag';
import { OAVBase } from './OAVBase';

@OAVComponent()
export class OAVComponentList extends OAVBase
{
	declare protected _space: GameObject;

	//
	// TODO: 迁移到 Vue 组件
	group: any;
	addComponentButton: any;

	constructor(attributeViewInfo: AttributeViewInfo)
	{
		super(attributeViewInfo);
	}

	private onAddComponentButtonClick()
	{
		menu.popup(menuConfig.getCreateComponentMenu(this.space));
	}

	get space()
	{
		return this._space;
	}

	set space(value)
	{
		this._space = value;
		this.dispose();
		this.initView();
	}

	get attributeName(): string
	{
		return this._attributeName;
	}

	get attributeValue(): Object
	{
		return this._space[this._attributeName];
	}

	set attributeValue(value: Object)
	{
		if (this._space[this._attributeName] !== value)
		{
			this._space[this._attributeName] = value;
		}
		this.updateView();
	}

	initView(): void
	{
		(this.group.layout as eui.VerticalLayout).gap = -1;

		const components: Component[] = this.attributeValue as any;
		for (let i = 0; i < components.length; i++)
		{
			this.addComponentView(components[i]);
		}
		this.space.on('addComponent', this.onAddCompont, this);
		this.space.on('removeComponent', this.onRemoveComponent, this);

		drag.register(this.addComponentButton, null, ['file_script'], (dragdata) =>
		{
			dragdata.getDragData('file_script').forEach((v) =>
			{
				this.space.addScript(v.scriptName);
			});
		});

		this.addComponentButton.addEventListener(egret.MouseEvent.CLICK, this.onAddComponentButtonClick, this);
	}

	dispose()
	{
		const components: Component[] = this.attributeValue as any;
		for (let i = 0; i < components.length; i++)
		{
			this.removedComponentView(components[i]);
		}

		this.space.off('addComponent', this.onAddCompont, this);
		this.space.off('removeComponent', this.onRemoveComponent, this);

		drag.unregister(this.addComponentButton);

		this.addComponentButton.removeEventListener(egret.MouseEvent.CLICK, this.onAddComponentButtonClick, this);
	}

	private addComponentView(component: Components)
	{
		if (component.hideFlags & HideFlags.HideInInspector)
		{
			return;
		}

		// TODO: 迁移到 Vue 组件
		// const displayObject = new ComponentView(component);
		// displayObject.percentWidth = 100;
		// this.group.addChild(displayObject);
		console.warn('OAVComponentList.addComponentView 需要迁移到 Vue 组件');
	}

	/**
	 * 更新界面
	 */
	updateView(): void
	{
		// TODO: 迁移到 Vue 组件
		// for (let i = 0, n = this.group.numChildren; i < n; i++)
		// {
		//     const child = this.group.getChildAt(i);
		//     if (child instanceof ComponentView)
		//     {
		//         child.updateView();
		//     }
		// }
		console.warn('OAVComponentList.updateView 需要迁移到 Vue 组件');
	}

	private removedComponentView(component: Components)
	{
		// TODO: 迁移到 Vue 组件
		// for (let i = this.group.numChildren - 1; i >= 0; i--)
		// {
		//     const displayObject = this.group.getChildAt(i);
		//     if (displayObject instanceof ComponentView && displayObject.component === component)
		//     {
		//         this.group.removeChild(displayObject);
		//     }
		// }
		console.warn('OAVComponentList.removedComponentView 需要迁移到 Vue 组件');
	}

	private onAddCompont(event: IEvent<{ gameobject: GameObject; component: Component; }>)
	{
		if (event.data.component.gameObject === this.space)
		{
			this.addComponentView(event.data.component);
		}
	}

	private onRemoveComponent(event: IEvent<{ gameobject: GameObject; component: Component; }>)
	{
		if (event.data.component.gameObject === this.space)
		{
			this.removedComponentView(event.data.component);
		}
	}
}
