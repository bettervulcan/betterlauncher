const config = require("gmll/config");
const { Auth } = require("msmc");
const gmll = require("gmll");
const { Instance } = gmll;

const authManager = new Auth("select_account");

const openLoginMS = () => {
  return authManager.launch("electron");
};

const launchClient = async (refreshToken, rootPath, versionName, memory) => {
  // TODO ADD MEMORY SUPPORT
  console.log(refreshToken, rootPath, versionName, memory);
  const xboxManager = await authManager.refresh(refreshToken);
  const token = await xboxManager.getMinecraft();
  console.log("Starting!");
  config.setRoot(rootPath);
  gmll.init().then(async () => {
    var int = new Instance({
      version: versionName,
      ram: memory,
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
  console.log(nickname, uuid, rootPath, versionName, memory);
  console.log("Starting!");
  config.setRoot(rootPath);
  gmll.init().then(async () => {
    var int = new Instance({
      version: versionName,
      ram: memory,
    });
    int.launch({
      profile: {
        id: "",
        name: nickname,
        demo: false,
      },
    });
  });

  return;
};

const downloadOnly = async (rootPath, versionName, cb) => {
  console.log(rootPath, versionName);
  config.setRoot(rootPath);
  await gmll.init().then(async () => {
    var int = new Instance({
      version: versionName,
    });
    const defEvents = config.getEventListener();
    defEvents.on("download.setup", (cores) => cb("setup", { cores }));
    defEvents.on("download.start", () => cb("start"));
    defEvents.on("download.progress", (key, index, total, left) =>
      cb("progress", { key, index, total, left })
    );
    defEvents.on("download.done", () => cb("done"));
    defEvents.on("download.fail", (key, type, err) => {
      switch (type) {
        case "retry":
          cb("fail.retry", { key });
          break;
        case "fail":
          cb("fail.fail", { key });
          break;
        case "system":
          cb("fail.system", { key, err });
          break;
      }
    });
    await int.install();
    cb = () => {};
    return;
  });
  return;
};

module.exports = {
  openLoginMS,
  launchClient,
  launchClientAsCrack,
  downloadOnly,
};
