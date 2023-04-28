const fs = require("fs");
const os = require("os");
const path = require("path");
const FileManager = require("./FileManager");

var config = {
  rootPath: getMinecraftPath(),
  lastVersions: [],
};

function getMinecraftPath() {
  const platform = os.platform();

  switch (platform) {
    case "win32":
      return path.join(process.env.APPDATA, ".minecraft");
    case "linux":
      return path.join(os.homedir(), ".minecraft");
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

const saveConfig = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await FileManager.writeToFileOrCreate(
        path.join(config.rootPath),
        "better.config",
        JSON.stringify(config)
      );
      console.log(
        `Config saved successfuly to ${path.join(
          config.rootPath,
          "better.config"
        )}`
      );
      return resolve(config);
    } catch (error) {
      console.error(error);
      return reject(error);
    }
  });
};

const loadConfig = () => {
  return new Promise(async (resolve, reject) => {
    if (!(await isConfigExist())) {
      console.log("Config doesnt exist");
      return resolve(await saveConfig());
    }
    try {
      config = JSON.parse(
        await fs.readFileSync(path.join(config.rootPath, "better.config"))
      );
      console.log(
        `Config loaded successfuly from ${path.join(
          config.rootPath,
          "better.config"
        )}`
      );
      return resolve(config);
    } catch (error) {
      console.error(error);
      return reject(error);
    }
  });
};

const isConfigExist = () => {
  return new Promise(async (resolve, reject) => {
    try {
      return resolve(
        await fs.existsSync(path.join(config.rootPath, "better.config"))
      );
    } catch (error) {
      return reject(err);
    }
  });
};

const setVariable = (varname, content) => {
  return new Promise((resolve, reject) => {
    if (varname === undefined || content === undefined)
      return reject("argument cant be undefined");
    config[varname] = content;
    return resolve(config);
  });
};

const getVariable = (varname) => {
  return new Promise((resolve, reject) => {
    if (varname === undefined) return reject("argument cant be undefined");
    if (config[varname] === undefined)
      return reject("this variable doesnt exist in config");
    return resolve(config[varname]);
  });
};

// ! tests
// loadConfig().then(() => {
//   setVariable("jd", "zawsze i wszedzie").then(() => {
//     getVariable("jd")
//       .then(console.log)
//       .then(() => {
//         getVariable("chuj")
//           .then(console.log)
//           .catch(console.error)
//           .then((v) => {
//             getVariable("rootPath")
//               .then(console.log)
//               .catch(console.error)
//               .then(saveConfig());
//           });
//       });
//   });
// });

module.exports = {
  saveConfig,
  loadConfig,
  isConfigExist,
  setVariable,
  getVariable,
};
