const { ipcRenderer } = require('electron');
const { shell } = require('electron');
const os = require('os');
const process = require('child_process');

/**
 * 选择文件夹窗口
 *
 * @param {event:Event,path:string} callback
 */
async function selectDirectoryDialog()
{
    const path = await new Promise((resolve) =>
    {
        ipcRenderer.once('selected-directory', (_event, path) =>
        {
            resolve(path);
        });
        ipcRenderer.send('open-file-dialog');
    });

    return path;
}

/**
 * 在资源管理器中显示
 *
 * @param {string} fullPath 完整路径
 */
function showFileInExplorer(fullPath)
{
    shell.showItemInFolder(fullPath);
}

/**
 * 打开开发者工具
 */
function openDevTools()
{
    ipcRenderer.send(`openDevTools`);
}

/**
 * 使用 VSCode 打开项目（文件）
 *
 * @param {string} projectPath 项目（文件）路径
 */
async function openWithVSCode(projectPath)
{
    await new Promise((resolve) =>
    {
        process.exec(`code "${projectPath}"`, function (error, stdout, stderr)
        {
            if (error !== null)
            {
                console.log(`exec error: ${error}`);
            }
            console.log(stdout);
            console.log(stderr);
            resolve(stderr);
        });
    });
}

exports.selectDirectoryDialog = selectDirectoryDialog;
exports.showFileInExplorer = showFileInExplorer;
exports.openWithVSCode = openWithVSCode;
exports.openDevTools = openDevTools;
