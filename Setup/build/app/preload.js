const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message) => ipcRenderer.send('message-from-renderer', message),
  onMessage: (callback) => ipcRenderer.on('message-from-main', callback),
});
