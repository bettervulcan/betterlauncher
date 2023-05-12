const FileManager = require("./FileManager");
const process = require("process");
const path = require("path");
const fs = require("fs");
const os = require("os");

const getMinecraftPath = () => {
  const platform = os.platform();

  switch (platform) {
    case "win32":
      return path.join(process.env.APPDATA, ".minecraft");
    case "linux":
      return path.join(os.homedir(), ".minecraft");
    default:
      throw new Error(`Unsupported platform: ${platform}.`);
  }
};

let config = {
  rootPath: getMinecraftPath(),
  lastVersions: [],
};

const saveConfig = async () => {
  try {
    await FileManager.writeToFileOrCreate(
      path.join(config.rootPath, "better.config"),
      JSON.stringify(config)
    );
    console.log(
      `Config saved successfully to  ${path.join(
        config.rootPath,
        "better.config"
      )}`
    );
    return config;
  } catch (error) {
    throw new Error(`Error saving config.\n${error}`);
  }
};

const loadConfig = () => {
  if (!isConfigExist()) {
    console.log("Config doesn't exist");
    return saveConfig();
  }
  config = JSON.parse(
    fs.readFileSync(path.join(config.rootPath, "better.config"))
  );
  console.log(
    `Config loaded successfuly from ${path.join(
      config.rootPath,
      "better.config"
    )}`
  );
  return config;
};

const isConfigExist = () => {
  try {
    return fs.existsSync(path.join(config.rootPath, "better.config"));
  } catch (error) {
    return error;
  }
};

const setVariable = (varname, content) => {
  if (varname === undefined || content === undefined)
    return "argument cant be undefined";
  config[varname] = content;
  return config;
};

const getVariable = (varname) => {
  if (varname === undefined) return "argument cant be undefined";
  if (config[varname] === undefined)
    return "this variable doesnt exist in config";
  return config[varname];
};

module.exports = {
  saveConfig,
  loadConfig,
  isConfigExist,
  setVariable,
  getVariable,
};
