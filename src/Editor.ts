import { serialization, View } from 'feng3d';
import { editorRS } from './assets/EditorRS';
import { editorcache } from './caches/Editorcache';
import { EditorData } from './global/EditorData';
import { editorui } from './global/editorui';
import { modules } from './Modules';
// Egret MouseEvent polyfill 已移除
import { Editorshortcut } from './shortcut/Editorshortcut';
import { editorAsset } from './ui/assets/EditorAsset';

/**
 * editor的版本号
 */
export const version = '0.5.1';

console.log(`editor version ${version}`);

/**
 * 编辑器
 * @deprecated Egret UI 已迁移到 Vue，此类仅保留初始化逻辑
 */
export class Editor
{
    constructor()
    {
        // giteeOauth.oauth();
        // 关闭右键默认菜单
        document.body.oncontextmenu = function () { return false; };

        // Egret 已移除，直接初始化
        this.onAddedToStage();
    }

    private async onAddedToStage()
    {
        // Egret 已移除，不再设置 stage
        // editorui.stage 将保持为 undefined 或使用占位对象

        //
        // 使用 Vue Message 组件的适配器（过渡期）
        // Vue Message 组件已在 App.vue 中挂载，这里只需要创建适配器实例
        const { createMessageAdapter } = await import('./vue-app/components/MessageAdapter');
        modules.message = createMessageAdapter() as any;

        await this.initEgret();
        await editorRS.initproject();
        await this.init();

        console.log(`初始化完成。`);
    }

    /**
     * 初始化 Egret
     * @deprecated Egret UI 已迁移到 Vue，此方法仅保留基础初始化
     */
    private async initEgret()
    {
        // Egret UI 层已迁移到 Vue，创建占位对象以保持向后兼容
        // 由于 Egret 脚本已移除，不再创建 Egret UI 层
        editorui.tooltipLayer = {} as any;
        editorui.popupLayer = {} as any;
        editorui.messageLayer = {} as any;
        //
        editorcache.projectname = editorcache.projectname || 'newproject';
    }

    private async init()
    {
        document.head.getElementsByTagName('title')[0].innerText = `feng3d-editor -- ${editorcache.projectname}`;

        editorcache.setLastProject(editorcache.projectname);

        await editorAsset.initproject();
        await editorAsset.runProjectScript();
        const scene = await editorAsset.readScene('default.scene.json');

        if (scene)
        {
            EditorData.editorData.gameScene = scene;
        }
        else
        {
            EditorData.editorData.gameScene = View.createNewScene();
        }

        //
        // MainView 已迁移到 Vue，不再需要初始化 Egret 的 MainView
        // 但需要创建一个占位对象以保持向后兼容
        this.initMainView();
        // eslint-disable-next-line no-new
        new Editorshortcut();
        // mouseEventEnvironment 已移除，Egret 已迁移到 Vue

        window.addEventListener('beforeunload', () =>
        {
            const obj = serialization.serialize(EditorData.editorData.gameScene.gameObject);
            editorRS.fs.writeObject('default.scene.json', obj);
        });
    }

    private initMainView()
    {
        //
        // MainView 已迁移到 Vue (MainLayout.vue)
        // 创建一个占位对象以保持向后兼容
        // 注意：不再添加到 Egret 舞台，因为 Vue 应用已经处理了布局
        editorui.mainview = {
            width: window.innerWidth,
            height: window.innerHeight,
        } as any;
    }
}
