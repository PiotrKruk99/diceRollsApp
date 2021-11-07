const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;
const path = require('path');
const { title } = require('process');

let mainWindow;
let remoteWindow = null;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        height: 200,
        width: 500,
        title: 'diceRollsApp',
        maximizable: false,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'mainPreload.js')
        }
    });

    mainWindow.on('closed', () => { app.quit(); });
    mainWindow.removeMenu();
    mainWindow.loadFile(path.join(__dirname, 'mainWindow.html'));

    if (process.env.NODE_ENV !== 'production') {
        mainWindow.webContents.send('isDevel');
    }

    function createRemoteWindow(sessionId = 0, sessionUrl = '') {
        if (remoteWindow !== null)
            return;

        let remoteUrl = 'http://www.dicerolls.liberezo.pl';

        if (sessionId > 0)
            remoteUrl += '/?userId=' + String(sessionId);

        if (sessionUrl !== '' && sessionUrl.includes('dicerolls.liberezo.pl/?userId='))
            remoteUrl = sessionUrl;

        remoteWindow = new BrowserWindow({
            height: 800,
            width: 800,
            parent: mainWindow,
            modal: true,
            webPreferences: {
                //preload: path.join(__dirname, 'remotePreload.js')
            }
        });

        remoteWindow.on('closed', () => {
            remoteWindow = null;
        });

        remoteWindow.on('page-title-updated', (event, title, explicitSet) => {
            event.preventDefault();
        });

        remoteWindow.loadURL(remoteUrl).then(() => {
            remoteWindow.setTitle(remoteWindow.webContents.getURL());
          });

        remoteWindow.removeMenu();
    }

    ipcMain.on('toggleDevel', () => {
        if (mainWindow.resizable)
            mainWindow.resizable = false;
        else
            mainWindow.resizable = true;

        mainWindow.webContents.toggleDevTools();
    });

    ipcMain.on('newSession', (event, idArg, urlArg) => {
        createRemoteWindow(idArg, urlArg);
        //console.log(String(idArg) + ' : ' + urlArg);
    });
});