const VersionManager = require("./managers/VersionManager");
const config = require("gmll/config");
const { Auth } = require("msmc");
const gmll = require("gmll");

const authManager = new Auth("select_account");

const openLoginMS = () => {
  return authManager.launch("electron");
};

const launchClient = async (refreshToken, rootPath, versionName, memory) => {
  // TODO ADD MEMORY SUPPORT
  console.log(
    refreshToken,
    rootPath,
    await VersionManager.getVersionNumberByName(versionName),
    memory
  );
  const xboxManager = await authManager.refresh(refreshToken);
  const token = await xboxManager.getMinecraft();
  console.log("Starting!");
  config.setRoot(rootPath);
  gmll.init().then(async () => {
    var int = new gmll.Instance({
      version: await VersionManager.getVersionNumberByName(versionName),
    });
    int.launch(token.gmll());
  });

  return;
};
const launchClientAsCrack = async (
  nickname,
  uuid,
  rootPath,
  versionName,
  memory
) => {
  console.log(
    nickname,
    uuid,
    rootPath,
    await VersionManager.getVersionNumberByName(versionName),
    memory
  );
  console.log("Starting!");
  config.setRoot(rootPath);
  gmll.init().then(async () => {
    var int = new gmll.Instance({
      version: await VersionManager.getVersionNumberByName(versionName),
    });
    int.launch(
      int.launch({
        profile: {
          id: "",
          name: "",
          demo: false,
        },
      })
    );
  });

  return;
};

const downloadOnly = async (rootPath, versionName, memory) => {
  console.log(rootPath, versionName, memory);
  return;
};

module.exports = {
  openLoginMS,
  launchClient,
  launchClientAsCrack,
  downloadOnly,
};
