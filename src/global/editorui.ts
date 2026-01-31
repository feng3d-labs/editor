import { ProjectView } from '../ui/assets/ProjectView';
import { MainView } from '../ui/MainView';
import { invalidateAssettree } from '../vue-app/views/ProjectViewAdapter';

export interface EditorUI
{
    stage: egret.Stage;
    assetview: ProjectView | { invalidateAssettree: () => void };
    mainview: MainView;
    tooltipLayer: eui.UILayer;
    popupLayer: eui.UILayer;

    messageLayer: eui.UILayer;
}

export const editorui: EditorUI = <any>{
    // 适配器：支持旧代码调用 editorui.assetview.invalidateAssettree()
    get assetview() {
        return {
            invalidateAssettree,
        } as any;
    },
};
