console.log("Loading prelaod");

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  log: (...logs) => ipcRenderer.on("log", ...logs),
});
