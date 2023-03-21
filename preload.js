console.log("Loading prelaod");

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  close: () => ipcRenderer.send("closeWindow"),
  minimalize: () => ipcRenderer.send("minimalizeWindow"),
});
