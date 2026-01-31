import { windowEventProxy } from 'feng3d';
import { editorui } from '../../global/editorui';
import { maskview } from './Maskview';

export type MenuItem = {
    /**
     * 显示标签
     */
    label?: string,
    /**
     * 优先级，数字越大，显示越靠前，默认为0
     */
    priority?: number;
    type?: 'separator',
    /**
     * 点击事件
     */
    click?: () => void,
    /**
     * 子菜单
     */
    submenu?: MenuItem[]
    /**
     * 是否启用，禁用时显示灰色
     */
    enable?: boolean;
    /**
     * 是否显示，默认显示
     */
    show?: boolean;
};

/**
 * Menu 类
 * @deprecated 请使用 Vue Menu 组件，此类作为过渡层
 */
export class Menu
{
    private adapter: any;

    constructor() {
        // 延迟加载适配器，避免循环依赖
        this.loadAdapter();
    }

    private async loadAdapter() {
        try {
            const { createMenuAdapter } = await import('../../vue-app/components/MenuAdapter');
            this.adapter = createMenuAdapter();
        } catch (error) {
            console.warn('Menu adapter not available, using fallback', error);
            // 如果适配器不可用，使用旧的实现作为后备
            this.adapter = new LegacyMenu();
        }
    }

    /**
     * 弹出菜单
     * @param menuItems 菜单数据
     * @returns 返回一个占位对象，用于兼容旧代码
     */
    popup(menuItems: MenuItem[]): any
    {
        if (!this.adapter) {
            // 如果适配器还没加载，延迟执行
            const placeholder = {
                x: windowEventProxy.clientX,
                y: windowEventProxy.clientY,
                addEventListener: () => {},
                removeEventListener: () => {},
                parent: null,
                stage: null,
            };
            this.loadAdapter().then(() => {
                this.adapter?.popup(menuItems);
            });
            return placeholder;
        }
        return this.adapter.popup(menuItems);
    }

    /**
     * 处理菜单中 show==false的菜单项
     * @param menuItem 菜单数据
     */
    handleShow(menuItem: MenuItem)
    {
        if (!this.adapter) {
            // 如果适配器还没加载，使用简单实现
            if (menuItem.submenu) {
                menuItem.submenu = menuItem.submenu.filter((v) => v.show !== false);
                menuItem.submenu.forEach((v) => this.handleShow(v));
            }
            return menuItem;
        }
        return this.adapter.handleShow(menuItem);
    }

    /**
     * 弹出枚举选择菜单
     * @param enumDefinition 枚举定义
     * @param currentValue 当前枚举值
     * @param selectCallBack 选择回调
     */
    popupEnum(enumDefinition: Object, currentValue: any, selectCallBack: (v: any) => void)
    {
        if (!this.adapter) {
            // 如果适配器还没加载，延迟执行
            this.loadAdapter().then(() => {
                this.adapter?.popupEnum(enumDefinition, currentValue, selectCallBack);
            });
            return;
        }
        this.adapter.popupEnum(enumDefinition, currentValue, selectCallBack);
    }
}

/**
 * 旧版 Menu 实现（作为后备）
 */
class LegacyMenu
{
    popup(menuItems: MenuItem[])
    {
        const menuItem = this.handleShow({ submenu: menuItems });
        if (menuItem.submenu && menuItem.submenu.length === 0) return;
        const menuUI = MenuUI.create(menuItem.submenu!, null);
        maskview.mask(menuUI);
        return menuUI;
    }

    handleShow(menuItem: MenuItem): MenuItem
    {
        if (menuItem.submenu)
        {
            const submenu = menuItem.submenu.filter((v) => v.show !== false);

            for (let i = submenu.length - 1; i >= 0; i--)
            {
                if (submenu[i].type === 'separator')
                {
                    if (i === 0 || i === submenu.length - 1)
                    {
                        submenu.splice(i, 1);
                    }
                    else if (submenu[i - 1].type === 'separator')
                    {
                        submenu.splice(i, 1);
                    }
                }
            }
            menuItem.submenu = submenu;
            menuItem.submenu.forEach((v) => this.handleShow(v));
        }

        return menuItem;
    }

    popupEnum(enumDefinition: Object, currentValue: any, selectCallBack: (v: any) => void)
    {
        const menu: MenuItem[] = [];
        for (const key in enumDefinition)
        {
            if (enumDefinition.hasOwnProperty(key))
            {
                if (isNaN(Number(key)))
                {
                    menu.push({
                        label: (currentValue === enumDefinition[key] ? '√ ' : '   ') + key,
                        click: ((v) =>
                            () => selectCallBack(v))(enumDefinition[key])
                    });
                }
            }
        }

        this.popup(menu);
    }
}

/**
 * 菜单
 */
export const menu = new Menu();

class MenuUI extends eui.List
{
    get subMenuUI()
    {
        return this._subMenuUI;
    }
    set subMenuUI(v)
    {
        if (this._subMenuUI)
        { this._subMenuUI.remove(); }
        this._subMenuUI = v;
        if (this._subMenuUI)
        { this._subMenuUI.parentMenuUI = this; }
    }
    private _subMenuUI: MenuUI;

    private parentMenuUI: MenuUI;

    get topMenu()
    {
        const m: MenuUI = this.parentMenuUI ? this.parentMenuUI.topMenu : this;

        return m;
    }

    constructor()
    {
        super();
        this.itemRenderer = MenuItemRenderer;
        this.onComplete();
    }

    static create(menuItems: MenuItem[], menuItemRendererRect: egret.Rectangle = null)
    {
        const menuUI = new MenuUI();
        const dataProvider = new eui.ArrayCollection();
        dataProvider.replaceAll(menuItems);

        menuUI.dataProvider = dataProvider;
        editorui.popupLayer.addChild(menuUI);

        if (!menuItemRendererRect)
        {
            menuUI.x = windowEventProxy.clientX;
            menuUI.y = windowEventProxy.clientY;

            if (menuUI.x + menuUI.width > editorui.popupLayer.stage.stageWidth - 10)
            { menuUI.x = editorui.popupLayer.stage.stageWidth - menuUI.width - 10; }
        }
        else
        {
            menuUI.x = menuItemRendererRect.right;
            menuUI.y = menuItemRendererRect.top;

            if (menuUI.x + menuUI.width > editorui.popupLayer.stage.stageWidth)
            {
                menuUI.x = menuItemRendererRect.left - menuUI.width;
            }
        }
        if (menuUI.y + menuUI.height > editorui.popupLayer.stage.stageHeight)
        { menuUI.y = editorui.popupLayer.stage.stageHeight - menuUI.height; }

        return menuUI;
    }

    private onComplete(): void
    {
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddedToStage, this);
        this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemovedFromStage, this);

        if (this.stage)
        {
            this.onAddedToStage();
        }
    }

    private onAddedToStage()
    {
        this.updateView();
    }

    private onRemovedFromStage()
    {
        this.subMenuUI = null;
        this.parentMenuUI = null;
    }

    private updateView()
    {
    }

    remove()
    {
        this.parent && this.parent.removeChild(this);
    }
}

class MenuItemRenderer extends eui.ItemRenderer
{
    declare data: MenuItem;
    menuUI: MenuUI;

    public selectedRect: eui.Rect;
    public label: eui.Label;
    public subSign: eui.Label;

    protected dataChanged()
    {
        super.dataChanged();
        this.updateView();
    }

    constructor()
    {
        super();
        this.once(eui.UIEvent.COMPLETE, this.onComplete, this);
        this.skinName = 'MenuItemRender';
    }

    private onComplete(): void
    {
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddedToStage, this);
        this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemovedFromStage, this);

        if (this.stage)
        {
            this.onAddedToStage();
        }
    }

    private onAddedToStage()
    {
        this.addEventListener(egret.MouseEvent.CLICK, this.onItemMouseDown, this, false, 1000);
        this.addEventListener(egret.MouseEvent.MOUSE_OVER, this.onItemMouseOver, this);
        this.addEventListener(egret.MouseEvent.MOUSE_OUT, this.onItemMouseOut, this);

        this.menuUI = this.parent as any;

        this.updateView();
    }

    private onRemovedFromStage()
    {
        this.removeEventListener(egret.MouseEvent.CLICK, this.onItemMouseDown, this, false);
        this.removeEventListener(egret.MouseEvent.MOUSE_OVER, this.onItemMouseOver, this);
        this.removeEventListener(egret.MouseEvent.MOUSE_OUT, this.onItemMouseOut, this);

        this.menuUI = null;
    }

    private updateView()
    {
        if (!this.data)
        { return; }
        this.touchEnabled = true;
        this.touchChildren = true;
        if (this.data.type === 'separator')
        {
            this.skin.currentState = 'separator';
            this.touchEnabled = false;
            this.touchChildren = false;
        }
        else
        {
            this.subSign.visible = (!!this.data.submenu && this.data.submenu.length > 0);
            this.skin.currentState = 'normal';
        }
        this.subSign.textColor = this.label.textColor = this.data.enable !== false ? 0x000000 : 0x6E6E6E;

        this.selectedRect.visible = false;
    }

    private onItemMouseDown(_event: egret.TouchEvent): void
    {
        if (this.data.enable === false) return;

        if (this.data.click)
        {
            this.data.click();
            this.menuUI.topMenu.remove();
        }
    }

    private onItemMouseOver()
    {
        if (this.data.submenu)
        {
            if (this.data.enable !== false)
            {
                const rect = this.getTransformedBounds(this.stage);
                this.menuUI.subMenuUI = MenuUI.create(this.data.submenu, rect);
                this.menuUI.subMenuUI.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onsubMenuUIRemovedFromeStage, this);
            }
        }
        else
        {
            this.menuUI.subMenuUI = null;
        }
        this.selectedRect.visible = this.data.enable !== false;
    }

    private onItemMouseOut()
    {
        if (!this.menuUI.subMenuUI)
        { this.selectedRect.visible = false; }
    }

    private onsubMenuUIRemovedFromeStage(e: egret.Event)
    {
        const current = e.currentTarget;
        current.removeEventListener(egret.Event.REMOVED_FROM_STAGE, this.onsubMenuUIRemovedFromeStage, this);
        this.selectedRect.visible = false;
    }
}
