// Vite 入口文件：将 Editor 类挂载到全局命名空间
import * as editorModule from './index';

// 扩展 Window 接口
declare global
{
    interface Window
    {
        editor: typeof editorModule;
        editorReady: boolean;
    }
}

// 确保 editor 命名空间存在
if (typeof window !== 'undefined')
{
    // 直接将整个模块挂载到 editor 命名空间
    window.editor = editorModule;
    // 标记 editor 模块已加载完成
    window.editorReady = true;

    // 触发自定义事件，通知模块已加载完成
    window.dispatchEvent(new CustomEvent('editorReady'));
}

egret.runEgret({ renderMode: "webgl", audioType: 0 });

// 导出所有内容
export * from './index';

