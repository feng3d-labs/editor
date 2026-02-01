import { OAVComponent, ParticleSystem, AttributeViewInfo, ParticleModule } from 'feng3d';
import { ParticleComponentView } from '../../ui/components/ParticleComponentView';
import { OAVBase } from './OAVBase';

@OAVComponent()
export class OAVParticleComponentList extends OAVBase
{
    declare protected _space: ParticleSystem;

    //
    // TODO: 迁移到 Vue 组件
    group: any;

    constructor(attributeViewInfo: AttributeViewInfo)
    {
        super(attributeViewInfo);
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
        // TODO: 迁移到 Vue 组件
        // if (this.group?.layout) {
        //     (<eui.VerticalLayout> this.group.layout).gap = -1;
        // }

        const components = <any> this.attributeValue;
        for (let i = 0; i < components.length; i++)
        {
            this.addComponentView(components[i]);
        }
    }

    dispose()
    {
        const components = <any> this.attributeValue;
        for (let i = 0; i < components.length; i++)
        {
            this.removedComponentView(components[i]);
        }
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
        //     if (child instanceof ParticleComponentView)
        //         { child.updateView(); }
        // }
        console.warn('OAVParticleComponentList.updateView 需要迁移到 Vue 组件');
    }

    private addComponentView(component: ParticleModule)
    {
        // TODO: 迁移到 Vue 组件
        // const displayObject = new ParticleComponentView(component);
        // displayObject.percentWidth = 100;
        // this.group.addChild(displayObject);
        console.warn('OAVParticleComponentList.addComponentView 需要迁移到 Vue 组件');
    }

    private removedComponentView(component: ParticleModule)
    {
        // TODO: 迁移到 Vue 组件
        // for (let i = this.group.numChildren - 1; i >= 0; i--)
        // {
        //     const displayObject = this.group.getChildAt(i);
        //     if (displayObject instanceof ParticleComponentView && displayObject.component === component)
        //     {
        //         this.group.removeChild(displayObject);
        //     }
        // }
        console.warn('OAVParticleComponentList.removedComponentView 需要迁移到 Vue 组件');
    }
}
