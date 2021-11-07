const electron = require('electron');
const {contextBridge, ipcRenderer} = electron;

contextBridge.exposeInMainWorld('MainApi', {
    toggleDevel: () => {ipcRenderer.send('toggleDevel');},
    onDevel: (func) => {ipcRenderer.on('isDevel', (event, arg) => func());},
    newSession: (id = 0, url = '') => {ipcRenderer.send('newSession', id, url);}
});