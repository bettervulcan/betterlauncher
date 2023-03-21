const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

// * dev only
require("electron-reload")(__dirname, {
  electron: require(`${__dirname}/node_modules/electron`),
});

require("ejs-electron");

var mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "assets", "img", "icon.png"),
    title: "BetterLauncher",
  });
  mainWindow.setTitle("BetterLauncher");
  mainWindow.loadFile(path.join(__dirname, "views", "main.ejs"));
  mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on("closeWindow", async (event) => {
  mainWindow.close();
});

ipcMain.on("minimalizeWindow", async (event) => {
  mainWindow.minimize();
});
