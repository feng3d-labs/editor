/* eslint-disable no-undef */
// eslint-disable-next-line spaced-comment
/// <reference path="../feng3d/dist/index.d.ts" />

const fstype = GetQueryString('fstype');

const result = [];

(async () =>
{
    if (fstype === 'indexedDB')
    {
        feng3d.indexedDBFS.projectname = decodeURI(GetQueryString('project'));
        feng3d.FS.fs = feng3d.indexedDBFS;
        feng3d.ReadRS.rs = new feng3d.ReadRS(feng3d.indexedDBFS);
    }
    // 初始化资源系统
    await feng3d.ReadRS.rs.init();
    loadProjectJs(initProject);
})();

async function loadProjectJs(callback)
{
    if (feng3d.FS.fs.type == feng3d.FSType.http)
    {
        const path = feng3d.FS.fs.getAbsolutePath('project.js');
        const script = document.createElement('script');
        script.onload = () => { callback(); };
        script.src = path;
        document.head.appendChild(script);
    }
    else
    {
        // 读取项目脚本
        const content = await feng3d.FS.fs.readString('project.js');
        //
        const windowEval = eval.bind(window);
        // 运行project.js
        windowEval(content);
        callback();
    }
}

async function initProject()
{
    const view = new feng3d.View();

    // 加载并初始化场景
    const obj = await feng3d.FS.fs.readObject('default.scene.json');

    const scene = await feng3d.ReadRS.rs.deserializeWithAssets(obj);
    if (scene.getComponent(feng3d.Scene))
    {
        view.scene = scene.getComponent(feng3d.Scene);
    }

    const cameras = view.root.getComponentsInChildren(feng3d.Camera);
    if (cameras.length > 0)
    {
        view.camera = cameras[0];
    }
    else
    {
        const camera = view.camera;
        camera.transform.z = -10;
        camera.transform.lookAt(new feng3d.Vector3());
    }
}

function GetQueryString(name)
{
    const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
    const r = window.location.search.substr(1).match(reg);
    if (r) return r[2];

    return null;
}
