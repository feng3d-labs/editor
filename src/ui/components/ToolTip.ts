/**
 * ToolTip 适配器
 * 导出 Vue ToolTip 适配器，保持向后兼容
 */
export { createToolTipAdapter } from '../../vue-app/components/ToolTipAdapter';

/**
 * ToolTip 实例（向后兼容）
 */
let toolTipInstance: any = null;

/**
 * 获取 ToolTip 实例
 */
export const toolTip = new Proxy({} as any, {
    get(_target, prop) {
        if (!toolTipInstance) {
            // 延迟加载适配器
            import('../../vue-app/components/ToolTipAdapter').then((module) => {
                toolTipInstance = module.createToolTipAdapter();
            });
            // 返回一个临时对象
            return () => {};
        }
        return toolTipInstance[prop];
    }
});

// 立即加载适配器
import('../../vue-app/components/ToolTipAdapter').then((module) => {
    toolTipInstance = module.createToolTipAdapter();
});
