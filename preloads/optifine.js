console.log("Loading prelaod");

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  updateDownloadState: (state) => ipcRenderer.on("updateDownloadState", state),
  runInstaller: (path) => ipcRenderer.sendSync("runOptifineInstaller", path),
  log: (...logs) => ipcRenderer.on("log", ...logs),
});
