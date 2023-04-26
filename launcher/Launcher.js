const { Client } = require("minecraft-launcher-core");
const { Auth } = require("msmc");
const ConfigManager = require("./managers/ConfigManager");
const VersionManager = require("./managers/VersionManager");

const authManager = new Auth("select_account");

const openLoginMS = () => {
  return new Promise(async (resolve, reject) => {
    authManager.launch("electron").then(resolve).catch(reject);
  });
};

const launchClient = async (refreshToken, rootPath, versionName, memory) => {
  console.log(refreshToken, rootPath, versionName, memory);
  return new Promise(async (resolve, reject) => {
    const launcher = new Client();
    const xboxManager = await authManager.refresh(refreshToken);
    const token = await xboxManager.getMinecraft();
    console.log("Starting!");
    launcher.launch({
      authorization: token.mclc(),
      root: rootPath,
      version: {
        number: await VersionManager.getVersionNumberByName(versionName),
        type: "release",
        custom: versionName,
      },
      memory,
    });

    launcher.on("debug", (e) => console.log(e));
    launcher.on("data", (e) => console.log(e));
    launcher.on("progress", (progress) => {
      console.log(progress);
    });

    resolve();
  });
};

module.exports = { openLoginMS, launchClient };
