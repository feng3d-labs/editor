// Vite 入口文件：将 Editor 类挂载到全局命名空间
import * as cannonPlugin from '@feng3d-plugins/cannon-plugin';
import * as feng3dModule from 'feng3d';
import { ClassUtils } from 'feng3d';
import * as editorModule from './index';
import { initQRCode } from './utils/QRCode';
import './utils/Tween'; // 初始化 Tween 更新循环

// 提前创建 Pinia 实例，确保在 EditorData 使用之前可用
import './vue-app/pinia';

// 直接将整个模块挂载到 editor 命名空间
window.editor = editorModule;
window.feng3d = window.feng3d || {} as any;
for (const key in feng3dModule)
{
    window.feng3d[key] = feng3dModule[key];
}

for (const key in cannonPlugin)
{
    window.feng3d[key] = cannonPlugin[key];
}

// 扩展 Window 接口
declare global
{
    interface Window
    {
        editor: typeof editorModule;
    }
}

// 覆盖 ClassUtils.getDefinitionByName，如果找不到类则从 feng3d 命名空间查找
if (typeof window !== 'undefined' && ClassUtils && ClassUtils.prototype)
{
    // 保存原始方法
    const originalGetDefinitionByName = ClassUtils.prototype.getDefinitionByName;

    // 覆盖方法
    ClassUtils.prototype.getDefinitionByName = function (name: string): any
    {
        // 先尝试使用原始方法查找
        let result = originalGetDefinitionByName.call(this, name);

        // 如果找不到，从 feng3d 命名空间中查找
        if (!result && window.feng3d && typeof name === 'string')
        {
            // 尝试直接通过类名查找
            if (window.feng3d[name])
            {
                result = window.feng3d[name];
            }
            else
            {
                // 尝试通过命名空间路径查找（例如 'PhysicsWorld' 或 'feng3d.PhysicsWorld'）
                const parts = name.split('.');
                let current: any = window.feng3d;

                for (const part of parts)
                {
                    if (current && current[part])
                    {
                        current = current[part];
                    }
                    else
                    {
                        current = null;
                        break;
                    }
                }

                if (current)
                {
                    result = current;
                }
            }
        }

        return result;
    };
}

// 初始化二维码功能
if (typeof window !== 'undefined' && document.readyState === 'loading')
{
    document.addEventListener('DOMContentLoaded', () =>
    {
        initQRCode(document.URL);
    });
}
else
{
    initQRCode(document.URL);
}

// 初始化 Vue 应用（必须在 Egret 之前，确保 Pinia 已激活）
// 这样 EditorData 在使用时 Pinia 已经可用
if (typeof window !== 'undefined')
{
    // 等待 DOM 加载完成
    if (document.readyState === 'loading')
    {
        document.addEventListener('DOMContentLoaded', async () =>
        {
            // 先挂载 Vue 应用，激活 Pinia
            await import('./vue-app/main');
            // 然后初始化 Egret
            egret.runEgret({ renderMode: 'webgl', audioType: 0 });
        });
    }
    else
    {
        // DOM 已准备好，立即挂载 Vue 应用
        import('./vue-app/main').then(() => {
            // Vue 应用挂载后，初始化 Egret
            egret.runEgret({ renderMode: 'webgl', audioType: 0 });
        });
    }
}
else
{
    // 非浏览器环境，直接初始化 Egret
    egret.runEgret({ renderMode: 'webgl', audioType: 0 });
}

// 导出所有内容
export * from './index';

