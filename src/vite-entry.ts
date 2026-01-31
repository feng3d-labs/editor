// Vite 入口文件：将 Editor 类挂载到全局命名空间
import * as editorModule from './index';

// 扩展 Window 接口
declare global
{
    interface Window
    {
        editor: typeof editorModule;
        editorReady: boolean;
        feng3d: any;
        CANNON: any;
    }
}

// 等待插件加载完成的函数
function waitForPlugins(): Promise<void>
{
    return new Promise((resolve) =>
    {
        // 检查插件是否已加载
        const checkPlugins = () =>
        {
            if (typeof window !== 'undefined'
                && window.feng3d
                && window.feng3d.PhysicsWorld
                && window.feng3d.Rigidbody
                && window.feng3d.PlaneCollider
                && window.feng3d.SphereCollider)
            {
                resolve();
            }
            else
            {
                // 如果插件还未加载，等待一段时间后重试
                setTimeout(checkPlugins, 10);
            }
        };

        checkPlugins();
    });
}

// 初始化函数
async function init()
{
    // 等待插件加载完成
    await waitForPlugins();

    // 确保 editor 命名空间存在
    if (typeof window !== 'undefined')
    {
        // 直接将整个模块挂载到 editor 命名空间
        window.editor = editorModule;
        // 标记 editor 模块已加载完成
        window.editorReady = true;

        // 触发自定义事件，通知模块已加载完成
        window.dispatchEvent(new CustomEvent('editorReady'));

        // 初始化 Egret
        egret.runEgret({ renderMode: "webgl", audioType: 0 });
    }
}

// 执行初始化
init();

// 导出所有内容
export * from './index';

