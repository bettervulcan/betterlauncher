const VersionManager = require("./managers/VersionManager");
const installer = require("@xmcl/installer");
const core = require("@xmcl/core");
const user = require("@xmcl/user");
const logger = require("./../logger");
const { Auth } = require("msmc");

const authManager = new Auth("select_account");

const openLoginMS = () => {
  return authManager.launch("electron");
};

const launchClient = async (refreshToken, rootPath, versionName, memory) => {
  logger.info(refreshToken, rootPath, versionName, memory);
  const xboxManager = await authManager.refresh(refreshToken);
  const token = await xboxManager.getMinecraft();
  logger.info("Installing!");
  const installAllTask = installer.installTask(
    await VersionManager.getVersionMeta(versionName),
    rootPath
  );
  await installAllTask.startAndWait({
    onUpdate(task) {
      logger.info(
        "onUpdate",
        task.name,
        installAllTask.progress,
        installAllTask.total
      );
    },
    onFailed(task, error) {
      logger.info("onFailed", task.name, error);
    },
    onSuccessed(task, result) {
      logger.info("onSuccessed", task.name, result);
    },
    onCancelled(task) {
      logger.info("onCancelled", task.name);
    },
  });
  logger.info("Starting!");
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
  logger.info(nickname, uuid, rootPath, versionName, memory);
  logger.info("Installing!");
  const installAllTask = installer.installTask(
    await VersionManager.getVersionMeta(versionName),
    rootPath
  );
  await installAllTask.startAndWait({
    onUpdate(task) {
      logger.info(
        "onUpdate",
        task.name,
        installAllTask.progress,
        installAllTask.total
      );
    },
    onFailed(task, error) {
      logger.info("onFailed", task.name, error);
    },
    onSuccessed(task, result) {
      logger.info("onSuccessed", task.name, result);
    },
    onCancelled(task) {
      logger.info("onCancelled", task.name);
    },
  });
  logger.info("Starting!");
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
  logger.info(rootPath, versionName);

  logger.info("Installing!");
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
  logger.info("InstallAllTask Done.");
  return;
};

module.exports = {
  openLoginMS,
  launchClient,
  launchClientAsCrack,
  downloadOnly,
};
