import { serialization, View } from 'feng3d';
import { editorRS } from './assets/EditorRS';
import { editorcache } from './caches/Editorcache';
import { EditorData } from './global/EditorData';
import { editorui } from './global/editorui';
import { modules } from './Modules';
import { Editorshortcut } from './shortcut/Editorshortcut';
import { editorAsset } from './ui/assets/EditorAsset';

/**
 * editor的版本号
 */
export const version = '0.5.1';

console.log(`editor version ${version}`);

/**
 * 编辑器
 */
export class Editor
{
    constructor()
    {
        // giteeOauth.oauth();
        // 关闭右键默认菜单
        document.body.oncontextmenu = function () { return false; };

        this.onAddedToStage();
    }

    private async onAddedToStage()
    {
        const { createMessageAdapter } = await import('./vue-app/components/MessageAdapter');
        modules.message = createMessageAdapter() as any;

        await this.initLayers();
        await editorRS.initproject();
        await this.init();

        console.log(`初始化完成。`);
    }

    private async initLayers()
    {
        editorui.tooltipLayer = {} as any;
        editorui.popupLayer = {} as any;
        editorui.messageLayer = {} as any;
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

        this.initMainView();
        // eslint-disable-next-line no-new
        new Editorshortcut();

        window.addEventListener('beforeunload', () =>
        {
            const obj = serialization.serialize(EditorData.editorData.gameScene.gameObject);
            editorRS.fs.writeObject('default.scene.json', obj);
        });
    }

    private initMainView()
    {
        editorui.mainview = {
            width: window.innerWidth,
            height: window.innerHeight,
        } as any;
    }
}
