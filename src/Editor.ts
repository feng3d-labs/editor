import { serialization, View } from 'feng3d';
import { editorRS } from './assets/EditorRS';
import { editorcache } from './caches/Editorcache';
import { EditorData } from './global/EditorData';
import { editorui } from './global/editorui';
import { modules } from './Modules';
import { mouseEventEnvironment } from './polyfill/egret/MouseEvent';
import { Editorshortcut } from './shortcut/Editorshortcut';
import { editorAsset } from './ui/assets/EditorAsset';
import { Message } from './ui/components/Message';
import { MainUI } from './ui/MainUI';
import { MainView } from './ui/MainView';

/**
 * editor的版本号
 */
export const version = '0.5.1';

console.log(`editor version ${version}`);

/**
 * 编辑器
 */
export class Editor extends eui.UILayer
{
    constructor()
    {
        super();
        // giteeOauth.oauth();
        // 关闭右键默认菜单
        document.body.oncontextmenu = function () { return false; };

        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddedToStage, this);
    }

    private async onAddedToStage()
    {
        editorui.stage = this.stage;

        //
        modules.message = new Message();

        await this.initEgret();
        await editorRS.initproject();
        await this.init();

        console.log(`初始化完成。`);
        // 移除无效入口类显示对象
        this.parent && this.parent.removeChild(this);
    }

    /**
     * 初始化 Egret
     */
    private async initEgret()
    {
        await new Promise(((resolve) =>
        {
            const mainui = new MainUI(() =>
            {
                //
                const tooltipLayer = new eui.UILayer();
                tooltipLayer.touchEnabled = false;
                this.stage.addChild(tooltipLayer);
                editorui.tooltipLayer = tooltipLayer;
                //
                const popupLayer = new eui.UILayer();
                popupLayer.touchEnabled = false;
                this.stage.addChild(popupLayer);
                editorui.popupLayer = popupLayer;
                //
                const messageLayer = new eui.UILayer();
                messageLayer.touchEnabled = false;
                this.stage.addChild(messageLayer);
                editorui.messageLayer = messageLayer;
                //
                editorcache.projectname = editorcache.projectname || 'newproject';

                editorui.stage.removeChild(mainui);
                resolve(undefined);
            });
            editorui.stage.addChild(mainui);
        }));
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
        this.initMainView();
        // eslint-disable-next-line no-new
        new Editorshortcut();
        mouseEventEnvironment();

        window.addEventListener('beforeunload', () =>
        {
            const obj = serialization.serialize(EditorData.editorData.gameScene.gameObject);
            editorRS.fs.writeObject('default.scene.json', obj);
        });
    }

    private initMainView()
    {
        //
        const mainView = new MainView();
        editorui.mainview = mainView;
        this.stage.addChildAt(mainView, 1);
    }
}
