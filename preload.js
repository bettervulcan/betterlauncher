console.log("Loading prelaod");

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  close: () => ipcRenderer.send("closeWindow"),
  minimalize: () => ipcRenderer.send("minimalizeWindow"),
  openLoginMS: () => ipcRenderer.send("openLoginMS"),
  storeLoginStatus: (func) => {
    ipcRenderer.on("statusLoginMS", func);
  },
  useCrack: (name) => ipcRenderer.send("useCrack", name),
  getAccounts: () => ipcRenderer.sendSync("getAccounts"),
  selectAccount: (uuid) => ipcRenderer.send("selectedAccount", uuid),
  getLastVersions: () => ipcRenderer.sendSync("getLastVersions"),
  selectVersion: (version) => ipcRenderer.send("selectedVersion", version),
  getInstalledVersions: () => ipcRenderer.sendSync("getInstalledVersions"),
  getVersionsByType: (type) => ipcRenderer.sendSync("getVersionsByType", type),
  getSummary: () => ipcRenderer.sendSync("getSummary"),
  runClient: () => ipcRenderer.send("runClient"),
});
