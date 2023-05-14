console.log("Loading prelaod");

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  close: () => ipcRenderer.send("closeWindow"),
  minimalize: () => ipcRenderer.send("minimalizeWindow"),
  getOptionsInfo: () => ipcRenderer.sendSync("getOptionsInfo"),
  storeDiscordInfo: (username, link) => {
    ipcRenderer.on("statusDiscord", username, link);
  },
  saveOptions: (options) => ipcRenderer.send("saveOptions", options),
  disconnectRPC: () => ipcRenderer.send("disconnectRPC"),
  openLoginMS: () => ipcRenderer.send("openLoginMS"),
  storeLoginStatus: (status) => {
    ipcRenderer.on("statusLoginMS", status);
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
