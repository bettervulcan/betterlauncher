const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const AccountsManager = require("./launcher/managers/AccountManager");
const VersionManager = require("./launcher/managers/VersionManager");
const OptifineScraper = require("./launcher/utils/OptifineScraper");
const ConfigManager = require("./launcher/managers/ConfigManager");
const FileManager = require("./launcher/managers/FileManager");
const JavaManager = require("./launcher/managers/JavaManager");
const DiscordRPC = require("./launcher/utils/DiscordRPC");
const LauncherMain = require("./launcher/Launcher");
const process = require("process");
const crypto = require("crypto");
const path = require("path");
const os = require("os");
const fs = require("fs");

const logsFile = path.join(
  ConfigManager.getVariable("rootPath"),
  "better",
  "latest.log"
);
FileManager.createIfNotExistFile(logsFile);

const log = console.log;
console.log = async (...args) => {
  log(...args);
  fs.appendFileSync(logsFile, args.join(" ") + "\n", "utf-8");
};

console.log(`Logs in ${logsFile} dir c:`);

const launchOptions = {
  accountObjSelected: "",
  versionNameSelected: "",
  memorySelected: 2,
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
    resizable: false,
    frame: false,
    webPreferences: {
      enableRemoteModule: false,
      contextIsolation: true,
      devTools: true,
      preload: path.join(__dirname, "preloads", "main.js"),
    },
    icon: path.join(__dirname, "assets", "icons", "logo.ico"),
    title: "BetterLauncher",
  });
  mainWindow.loadFile(path.join(__dirname, "views", "main.ejs"));

  ConfigManager.loadConfig();
  AccountsManager.loadAccounts();
  VersionManager.cacheVersions();
  try {
    DiscordRPC.setupRPC((success, dcUser) => {
      mainWindow.webContents.on("did-finish-load", () => {
        if (success) {
          mainWindow.webContents.send(
            "statusDiscord",
            true,
            dcUser.username,
            `https://cdn.discordapp.com/avatars/${dcUser.id}/${dcUser.avatar}?size=24`
          );
        } else {
          mainWindow.webContents.send("statusDiscord", false);
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  ConfigManager.saveConfig();
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on("closeWindow", async () => {
  mainWindow.close();
});

ipcMain.on("minimalizeWindow", async () => {
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
  try {
    event.returnValue = await AccountsManager.getAccountsList();
  } catch (error) {
    event.returnValue = undefined;
    throw new Error(`Error getting information from main.\n${error}}`);
  }
});

ipcMain.on("selectedAccount", async (event, arg) => {
  launchOptions.accountObjSelected = await AccountsManager.getAccountByUUID(
    arg
  );
  console.log("zalogowano na konto", launchOptions.accountObjSelected);
  await AccountsManager.setLastAccount(arg);
});

ipcMain.on("getLastVersions", async (event) => {
  try {
    event.returnValue = await VersionManager.getLastVersions();
  } catch (error) {
    event.returnValue = undefined;
    throw new Error(`Error getting information from main.\n${error}}`);
  }
});

ipcMain.on("selectedVersion", async (event, arg) => {
  await VersionManager.addLastVersion(arg);
  launchOptions.versionNameSelected = arg;
  console.log("wybrano wersje:", launchOptions.versionNameSelected);
});

ipcMain.on("getInstalledVersions", async (event) => {
  try {
    event.returnValue = await VersionManager.getInstalledVersions();
  } catch (error) {
    event.returnValue = undefined;
    throw new Error(`Error getting information from main.\n${error}}`);
  }
});

ipcMain.on("disconnectRPC", async () => {
  DiscordRPC.disconnectRPC();
});

ipcMain.on("getVersionsByType", async (event, arg) => {
  try {
    let groupedVersions = [];
    if (arg == "alpha") {
      groupedVersions = Object.values(
        await VersionManager.getAvailableVersions("old_alpha")
      ).concat(
        Object.values(await VersionManager.getAvailableVersions("old_beta"))
      );
    } else if (arg == "optifine") {
      groupedVersions = Object.values(await OptifineScraper.scrapSite());
    } else {
      groupedVersions = Object.values(
        await VersionManager.getAvailableVersions(arg)
      );
    }
    let versionout = [];
    switch (arg) {
      case "release":
        groupedVersions.forEach((version) => {
          let mainversion =
            version.name.split(".")[0] + "." + version.name.split(".")[1];
          if (!versionout[mainversion]) {
            versionout[mainversion] = [];
          }
          versionout[mainversion].push(version.name);
        });
        break;
      case "snapshot":
        groupedVersions.forEach((version) => {
          if (version.name.includes("w")) {
            let mainversion = version.name.split("w")[0];
            if (!versionout[mainversion]) {
              versionout[mainversion] = [];
            }
            versionout[mainversion].push(version.name);
          } else if (version.name.includes("-")) {
            let mainversion = version.name.split("-")[0];
            if (!versionout[mainversion]) {
              versionout[mainversion] = [];
            }
            versionout[mainversion].push(version.name);
          } else {
            let mainversion = version.name;
            if (!versionout[mainversion]) {
              versionout[mainversion] = [];
            }
            versionout[mainversion].push(version.name);
          }
        });
        break;
      case "optifine":
        groupedVersions.forEach((version) => {
          version = Object.values(version);
          if (!versionout[version[0].mc]) {
            versionout[version[0].mc] = [];
          }
          version.forEach((subVer) => {
            versionout[version[0].mc].push(`${subVer.mc}_${subVer.optifine}`);
          });
        });
        break;
      default:
        groupedVersions.forEach((version) => {
          if (!versionout[version.name]) {
            versionout[version.name] = [];
          }
          versionout[version.name].push(version.name);
        });
        break;
    }
    event.returnValue = Object.values(versionout);
  } catch (error) {
    event.returnValue = undefined;
    throw new Error(`Error getting information from main.\n${error}}`);
  }
});

ipcMain.on("getSummary", async (event) => {
  try {
    let safeOptions = JSON.stringify(launchOptions);
    safeOptions = JSON.parse(safeOptions);
    delete safeOptions.accountObjSelected.refreshToken;
    event.returnValue = safeOptions;
  } catch (error) {
    event.returnValue = undefined;
    throw new Error(`Error getting information from main.\n${error}}`);
  }
});

ipcMain.on("getOptionsInfo", async (event) => {
  try {
    event.returnValue = {
      memory: {
        selected: parseInt(launchOptions.memorySelected),
        max: Math.round(os.totalmem() / (1024 * 1024 * 1024)),
      },
      java: { path: await JavaManager.getJavaExecPath() },
      game: { dir: await ConfigManager.getVariable("rootPath") },
      javaArgs: process.env._JAVA_OPTIONS,
    };
  } catch (error) {
    event.returnValue = undefined;
    throw new Error(`Error getting information from main.\n${error}}`);
  }
});

ipcMain.on("downloadOptifine", async (event, mc, optifine) => {
  const downladWindow = new BrowserWindow({
    height: 300,
    width: 600,
    resizable: false,
    webPreferences: {
      enableRemoteModule: false,
      contextIsolation: true,
      devTools: true,
      preload: path.join(__dirname, "preloads", "optifine.js"),
    },
    icon: path.join(__dirname, "assets", "icons", "logo.ico"),
    title: `Optifine ${mc} ${optifine} Downloader`,
    parent: mainWindow,
    autoHideMenuBar: true,
    modal: true,
  });

  downladWindow.loadFile(path.join("views", "others", "optifine.ejs"));

  let globalDone = false,
    doneCount = 0;

  await LauncherMain.downloadOnly(
    ConfigManager.getVariable("rootPath"),
    mc,
    async (type, args) => {
      console.log(type, args);
      switch (type) {
        case "progress":
          downladWindow.webContents.send("updateDownloadState", "mc", {
            finished: false,
            progrss: (args.index / args.total) * 100,
          });
          console.log({
            finished: false,
            progrss: (args.index / args.total) * 100,
          });
          break;
        case "done":
          doneCount++;
          downladWindow.webContents.send("updateDownloadState", "mc", {
            finished: false,
            doneCount,
          });

          if (!globalDone) {
            globalDone = true;
            await OptifineScraper.downloadInstaller(
              (
                await OptifineScraper.scrapSite()
              )[mc][optifine],
              (data) => {
                downladWindow.webContents.send(
                  "updateDownloadState",
                  "of",
                  data
                );

                // if (data.finished) JavaManager.executeJar(data.optifineJarPath);
              }
            );
          }
          break;
      }
    }
  );
});

ipcMain.on("saveOptions", (event, args) => {
  console.log(args);
  launchOptions.memorySelected = args.ram;
  // TODO SEND JAVA PATH (args.java) TO JAVA MANAGER (replace the \n to "" on the end)
  if (ConfigManager.getVariable("rootPath") !== path.join(args.game)) {
    const oldPath = ConfigManager.getVariable("rootPath");
    ConfigManager.setVariable("rootPath", path.join(args.game));
    ConfigManager.saveConfig(oldPath);
    ConfigManager.saveConfig();
  }
  // TODO USE CUSTOM/GLOBAL JAVA ARGS
});

ipcMain.on("getDir", async (event, isJava, defaultLocation) => {
  try {
    const dir = await dialog.showOpenDialog({
      title: isJava
        ? "Select Java Executable (javaw.exe)"
        : "Select Minecraft RunDir (.minecraft)",
      defaultPath: defaultLocation,
      filters: [isJava ? { name: "Java Executable", extensions: ["exe"] } : {}],
      properties: [isJava ? "openFile" : "openDirectory"],
    });
    event.returnValue = dir;
  } catch (error) {
    event.returnValue = undefined;
    throw new Error(`Error getting information from main.\n${error}}`);
  }
});

ipcMain.on("runOptifineInstaller", async (event, path) => {
  try {
    JavaManager.executeJar(path);
    event.returnValue = undefined;
  } catch (error) {
    event.returnValue = undefined;
    throw new Error(`Error getting information from main.\n${error}}`);
  }
});

ipcMain.on("runClient", async () => {
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
