/**
 * 模块
 *
 * 用于管理功能模块
 * @deprecated Egret 模块系统已迁移到 Vue，此类保留用于向后兼容
 */
export class Modules
{
    // Message 已迁移到 Vue，使用适配器
    message: any;

    /**
     * 获取模块视图
     * @deprecated Egret 模块视图已迁移到 Vue，此方法不再使用
     */
    getModuleView(moduleName: string)
    {
        console.warn(`getModuleView(${moduleName}) 已废弃，请使用 Vue 组件`);
        return null;
    }

    /**
     * 回收模块界面
     * @deprecated Egret 模块视图已迁移到 Vue，此方法不再使用
     */
    recycleModuleView(moduleView: any)
    {
        console.warn('recycleModuleView 已废弃，请使用 Vue 组件');
    }

    /**
     * 模块界面类定义
     * @deprecated Egret 模块视图已迁移到 Vue，此属性不再使用
     */
    static moduleViewCls: { [name: string]: any } = {};
}

export const modules = new Modules();
