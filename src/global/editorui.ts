// ProjectView 已迁移到 Vue，不再需要导入
// import { ProjectView } from '../ui/assets/ProjectView';
import { invalidateAssettree } from '../vue-app/views/ProjectViewAdapter';

export interface EditorUI
{
    stage: egret.Stage;
    assetview: { invalidateAssettree: () => void };
    mainview: { width: number; height: number } | any; // MainView 已迁移到 Vue
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
