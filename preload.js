console.log("Loading prelaod");

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  close: () => ipcRenderer.send("closeWindow"),
  minimalize: () => ipcRenderer.send("minimalizeWindow"),
  getOptionsInfo: () => ipcRenderer.sendSync("getOptionsInfo"),
  openLoginMS: () => ipcRenderer.send("openLoginMS"),
  storeLoginStatus: (func) => {
    ipcRenderer.on("statusLoginMS", func);
  },
  getAccounts: () => ipcRenderer.sendSync("getAccounts"),
  getLastVersions: () => ipcRenderer.sendSync("getLastVersions"),
  getInstalledVersions: () => ipcRenderer.sendSync("getInstalledVersions"),
  getVersionsByType: (type) => ipcRenderer.sendSync("getVersionsByType", type),
  selectVersion: (version) => ipcRenderer.send("selectedVersion", version),
  selectAccount: (uuid) => ipcRenderer.send("selectedAccount", uuid),
  useCrack: (name) => ipcRenderer.send("useCrack", name),
  getSummary: () => ipcRenderer.sendSync("getSummary"),
  getDirByElectron: (isJava, defaultLocation) =>
    ipcRenderer.sendSync("getDir", isJava, defaultLocation),
  runClient: () => ipcRenderer.send("runClient"),
});
