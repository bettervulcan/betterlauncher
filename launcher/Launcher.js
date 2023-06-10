const VersionManager = require("./managers/VersionManager");
const core = require("@xmcl/core");
const installer = require("@xmcl/installer");
const user = require("@xmcl/user");
const { Auth } = require("msmc");

const authManager = new Auth("select_account");

const openLoginMS = () => {
  return authManager.launch("electron");
};

const launchClient = async (refreshToken, rootPath, versionName, memory) => {
  console.log(refreshToken, rootPath, versionName, memory);
  const xboxManager = await authManager.refresh(refreshToken);
  const token = await xboxManager.getMinecraft();
  console.log("Installing!");
  const installAllTask = installer.installTask(
    await VersionManager.getVersionMeta(versionName),
    rootPath
  );
  await installAllTask.startAndWait({
    onUpdate(task) {
      console.log(
        "onUpdate",
        task.name,
        installAllTask.progress,
        installAllTask.total
      );
    },
    onFailed(task, error) {
      console.log("onFailed", task.name, error);
    },
    onSuccessed(task, result) {
      console.log("onSuccessed", task.name, result);
    },
    onCancelled(task) {
      console.log("onCancelled", task.name);
    },
  });
  console.log("Starting!");
  const javaPath =
    "C:\\Program Files\\Eclipse Adoptium\\jre-17.0.6.10-hotspot\\bin\\java.exe";
  // TODO: repair java path wtf
  const game = await core.launch({
    accessToken: token.mcToken,
    gameProfile: token.profile,
    gamePath: rootPath,
    version: versionName,
    maxMemory: memory,
    javaPath: javaPath.toString(),
    extraExecOption: { detached: true },
  });
  game.on("error", (err) => {
    throw err;
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
  console.log("Installing!");
  const installAllTask = installer.installTask(
    await VersionManager.getVersionMeta(versionName),
    rootPath
  );
  await installAllTask.startAndWait({
    onUpdate(task) {
      console.log(
        "onUpdate",
        task.name,
        installAllTask.progress,
        installAllTask.total
      );
    },
    onFailed(task, error) {
      console.log("onFailed", task.name, error);
    },
    onSuccessed(task, result) {
      console.log("onSuccessed", task.name, result);
    },
    onCancelled(task) {
      console.log("onCancelled", task.name);
    },
  });
  console.log("Starting!");
  const javaPath =
    "C:\\Program Files\\Eclipse Adoptium\\jre-17.0.6.10-hotspot\\bin\\java.exe";
  // TODO: repair java path wtf

  const game = await core.launch({
    gameProfile: user.offline(nickname, uuid).selectedProfile,
    gamePath: rootPath,
    version: versionName,
    maxMemory: memory,
    javaPath: javaPath.toString(),
    extraExecOption: { detached: true },
  });
  game.on("error", (err) => {
    throw err;
  });
  return;
};

const downloadOnly = async (rootPath, versionName, cb) => {
  console.log(rootPath, versionName);

  console.log("Installing!");
  const installAllTask = installer.installTask(
    await VersionManager.getVersionMeta(versionName),
    rootPath
  );
  await installAllTask.startAndWait({
    onUpdate(task) {
      cb("progress", {
        name: task.name,
        index: installAllTask.progress,
        total: installAllTask.total,
      });
    },
    onFailed(task, error) {
      cb("onFailed", task.name, error);
    },
  });

  cb = () => {};
  console.log("InstallAllTask Done.");
  return;
};

module.exports = {
  openLoginMS,
  launchClient,
  launchClientAsCrack,
  downloadOnly,
};
