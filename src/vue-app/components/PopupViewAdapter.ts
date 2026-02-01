import { popupView, PopupviewParam } from './PopupView';
import { objectview } from 'feng3d';

/**
 * PopupView 适配器，兼容原有的 popupview API
 * 用于在 Vue 和 Egret 混合环境中使用
 */
export class PopupViewAdapter {
    /**
     * 弹出一个 objectview
     */
    popupObject<T>(object: T, param: PopupviewParam<T> = {}) {
        // 尝试使用 Vue 版本的 PopupView
        try {
            return popupView.popupObject(object, param);
        } catch (e) {
            // 如果失败，回退到 Egret 版本
            const editorui = (global as any).editorui;
            if (editorui && editorui.popupView) {
                return editorui.popupView.popupObject(object, param);
            }
            throw e;
        }
    }

    /**
     * 弹出一个界面
     */
    popupView(view: any, param: PopupviewParam<any> = {}) {
        // 检查是否是 Egret 组件
        if (view && (view.stage || view instanceof (global as any).egret.DisplayObject)) {
            // Egret 组件，使用原来的方式
            const editorui = (global as any).editorui;
            if (editorui && editorui.popupView) {
                return editorui.popupView.popupView(view, param);
            }
        }
        
        // Vue 组件或 DOM 元素
        return popupView.popupView(view, param);
    }

    /**
     * 弹出一个包含objectview的窗口
     */
    popupObjectWindow<T>(object: T, param: PopupviewParam<T> = {}) {
        try {
            return popupView.popupObjectWindow(object, param);
        } catch (e) {
            const editorui = (global as any).editorui;
            if (editorui && editorui.popupView) {
                return editorui.popupView.popupObjectWindow(object, param);
            }
            throw e;
        }
    }

    /**
     * 弹出一个包含给出界面的窗口
     */
    popupViewWindow(view: any, param: PopupviewParam<any> = {}) {
        // 检查是否是 Egret 组件
        if (view && (view.stage || view instanceof (global as any).egret.DisplayObject)) {
            const editorui = (global as any).editorui;
            if (editorui && editorui.popupView) {
                return editorui.popupView.popupViewWindow(view, param);
            }
        }
        
        return popupView.popupViewWindow(view, param);
    }
}

// 导出单例，兼容原有 API
export const popupview = new PopupViewAdapter();
