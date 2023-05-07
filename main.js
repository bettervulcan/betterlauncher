const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const AccountsManager = require("./launcher/managers/AccountManager");
const VersionManager = require("./launcher/managers/VersionManager");
const ConfigManager = require("./launcher/managers/ConfigManager");
const JavaManager = require("./launcher/managers/JavaManager");
const LauncherMain = require("./launcher/Launcher");
const crypto = require("crypto");
const path = require("path");
const os = require("os");

const launchOptions = {
  accountObjSelected: "",
  versionNameSelected: "",
  memorySelected: { min: "512M", max: "1G" },
};

//TODO * dev only
require("electron-reload")(__dirname, {
  electron: require(`${__dirname}/node_modules/electron`),
});

require("ejs-electron");

var mainWindow;

const createWindow = () => {
  const { screen } = require("electron");
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    height: Math.round(height * 0.8),
    width: Math.round(width * 0.7),
    // frame: false,
    webPreferences: {
      enableRemoteModule: false,
      contextIsolation: true,
      devTools: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "assets", "img", "icon.png"),
    title: "BetterLauncher",
  });
  mainWindow.setTitle("BetterLauncher");
  mainWindow.loadFile(path.join(__dirname, "views", "main.ejs"));

  // mainWindow.openDevTools();
  ConfigManager.loadConfig();
  AccountsManager.loadAccounts();
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

ipcMain.on("openLoginMS", (event) => {
  LauncherMain.openLoginMS()
    .then(async (loginObj) => {
      const profile = await loginObj.getMinecraft();
      await AccountsManager.addAccount({
        premium: true,
        uuid: profile.profile.id,
        displayName: profile.profile.name,
        refreshToken: await loginObj.save(),
      });
      event.sender.send("statusLoginMS", "Success");
    })
    .catch((err) => {
      console.log("err", err); // ? on gui cloased or something xD
      if (err === "error.gui.closed")
        return event.sender.send("statusLoginMS", `Przerwano logowanie`);
      event.sender.send("statusLoginMS", `Error ${JSON.stringify(err)}`);
    });
});

ipcMain.on("useCrack", async (event, name) => {
  await AccountsManager.addAccount({
    premium: false,
    uuid: crypto.randomUUID().replaceAll("-", ""),
    displayName: name,
  });
});

ipcMain.on("getAccounts", async (event) => {
  event.returnValue = await AccountsManager.getAccountsList();
});

ipcMain.on("selectedAccount", async (event, arg) => {
  launchOptions.accountObjSelected = await AccountsManager.getAccountByUUID(
    arg
  );
  console.log("zalogowano na konto", launchOptions.accountObjSelected);
  await AccountsManager.setLastAccount(arg);
});

ipcMain.on("getLastVersions", async (event) => {
  event.returnValue = await VersionManager.getLastVersions();
});

ipcMain.on("selectedVersion", async (event, arg) => {
  await VersionManager.addLastVersion(arg);
  launchOptions.versionNameSelected = arg;
  console.log("wybrano wersje:", launchOptions.versionNameSelected);
});

ipcMain.on("getInstalledVersions", async (event, arg) => {
  event.returnValue = await VersionManager.getInstalledVersions();
});

ipcMain.on("getVersionsByType", async (event, arg) => {
  const groupedVersions = Object.values(
    await VersionManager.getAvailableVersions(arg)
  )
    .map((ver) => ver.name)
    .reduce((acc, version) => {
      const majorMinor = version.split(".").slice(0, 2).join(".");
      if (!acc[majorMinor]) {
        acc[majorMinor] = [];
      }
      acc[majorMinor].push(version);
      return acc;
    }, {});

  event.returnValue = Object.values(groupedVersions);
});

ipcMain.on("getSummary", async (event) => {
  let safeOptions = JSON.stringify(launchOptions);
  safeOptions = JSON.parse(safeOptions);
  delete safeOptions.accountObjSelected.refreshToken;
  event.returnValue = safeOptions;
});

ipcMain.on("getOptionsInfo", async (event) => {
  event.returnValue = {
    memory: {
      selected: parseInt(launchOptions.memorySelected.max.replace("G")),
      max: Math.round(os.totalmem() / (1024 * 1024 * 1024)),
    },
    java: { path: await JavaManager.getJavaExecDir() },
    game: { dir: await ConfigManager.getVariable("rootPath") },
    javaArgs: process.env._JAVA_OPTIONS,
  };
});

ipcMain.on("getDir", async (event, isJava, defaultLocation) => {
  console.log(
    await dialog.showOpenDialog({
      title: isJava
        ? "Select Java Executable(javaw.exe)"
        : "Select Minecraft RunDir (.minecraft)",
      defaultPath: defaultLocation,
      filters: [isJava ? { name: "Java Executable", extensions: ["exe"] } : {}],
      properties: [isJava ? "openFile" : "openDirectory"],
    })
  );
});

ipcMain.on("runClient", async (event) => {
  if (launchOptions.accountObjSelected.premium) {
    await LauncherMain.launchClient(
      launchOptions.accountObjSelected.refreshToken,
      path.join(await ConfigManager.getVariable("rootPath")),
      launchOptions.versionNameSelected,
      launchOptions.memorySelected
    ).catch(console.log);
  } else {
    await LauncherMain.launchClientAsCrack(
      launchOptions.accountObjSelected.displayName,
      launchOptions.accountObjSelected.uuid,
      path.join(await ConfigManager.getVariable("rootPath")),
      launchOptions.versionNameSelected,
      launchOptions.memorySelected
    ).catch(console.log);
  }
});
