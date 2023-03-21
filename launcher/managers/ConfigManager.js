const fs = require("fs");

var config = { rootPath: `${process.env.APPDATA}\\.minecraft` };

const saveConfig = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await fs.writeFileSync(
        config.rootPath + "\\better.config",
        JSON.stringify(config)
      );
      console.log(`Config saved successfuly to ${config.rootPath}`);
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
        await fs.readFileSync(config.rootPath + "\\better.config")
      );
      console.log(`Config loaded successfuly from ${config.rootPath}`);
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
      return resolve(await fs.existsSync(config.rootPath + "\\better.config"));
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
