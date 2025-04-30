console.log("preload.js carregado com sucesso!");

// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel, data) => ipcRenderer.send(channel, data), // Exposição segura do método `send`
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)), // Exposição segura do método `on`
  },
});
