const { Client } = require("minecraft-launcher-core");
const { Auth } = require("msmc");
const ConfigManager = require("./managers/ConfigManager");
const VersionManager = require("./managers/VersionManager");
const launcher = new Client();

const authManager = new Auth("select_account");

const openLoginMS = () => {
  return new Promise(async (resolve, reject) => {
    authManager.launch("electron").then(resolve).catch(reject);
  });
};

const launchClient = async (refreshToken, rootPath, versionName, memory) => {
  console.log(refreshToken, rootPath, versionName, memory);
  return new Promise(async (resolve, reject) => {
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
const launchClientAsCrack = async (
  nickname,
  uuid,
  rootPath,
  versionName,
  memory
) => {
  console.log(nickname, uuid, rootPath, versionName, memory);
  return new Promise(async (resolve, reject) => {
    console.log("Starting!");
    launcher.launch({
      authorization: {
        access_token: "",
        client_token: "",
        uuid,
        name: nickname,
        user_properties: "{}",
        meta: {
          type: "mojang",
          demo: false,
          xuid: "",
          clientId: "",
        },
      },
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

module.exports = { openLoginMS, launchClient, launchClientAsCrack };
