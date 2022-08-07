const { ipcMain, dialog } = require('electron');

ipcMain.on('open-file-dialog', async (event) =>
{
    const result = await dialog.showOpenDialog({
        properties: ['openFile', 'openDirectory']
    });
    if (result.filePaths)
    {
        event.sender.send('selected-directory', result.filePaths[0]);
    }
});

ipcMain.on('openDevTools', (event) =>
{
    if (event && event.sender)
    {
        event.sender.openDevTools();
    }
});
