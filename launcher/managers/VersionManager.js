const fs = require("fs");
const axios = require("axios");
const ConfigManager = require("./ConfigManager");

const VersionManifest =
    "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json",
  ForgeManifest = "",
  FabricManifest = "";

const getInstalledVersions = () => {
  return new Promise(async (resolve, reject) => {
    const versionsRootPath =
      (await ConfigManager.getVariable("rootPath")) + "\\versions";
    try {
      const versions = (
        await fs.readdirSync(versionsRootPath, { withFileTypes: true })
      )
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);
      resolve(versions);
    } catch (error) {
      reject(error);
    }
  });
};

const getAvailableVersions = (type) => {
  return new Promise(async (resolve, reject) => {
    axios
      .get(VersionManifest)
      .then((res) => {
        let versionList = [];
        res.data.versions.forEach((version) => {
          if (version.type != type) return;
          versionList[version.id] = { name: version.id, url: version.url };
        });
        resolve(versionList);
      })
      .catch(reject);
  });
};

const downloadVersionJson = (versionObject) => {
  return new Promise(async (resolve, reject) => {
    axios({
      method: "get",
      url: versionObject.url,
      responseType: "stream",
    })
      .then(async (response) => {
        if (
          !(await fs.existsSync(
            (await ConfigManager.getVariable("rootPath")) +
              "\\versions\\" +
              versionObject.name
          ))
        ) {
          await fs.mkdirSync(
            (await ConfigManager.getVariable("rootPath")) +
              "\\versions\\" +
              versionObject.name
          );
        }
        if (
          !(await fs.existsSync(
            (await ConfigManager.getVariable("rootPath")) +
              "\\versions\\" +
              versionObject.name +
              "\\" +
              versionObject.name +
              ".json"
          ))
        ) {
          await fs.openSync(
            (await ConfigManager.getVariable("rootPath")) +
              "\\versions\\" +
              versionObject.name +
              "\\" +
              versionObject.name +
              ".json",
            "w"
          );
        }
        response.data.pipe(
          fs.createWriteStream(
            (await ConfigManager.getVariable("rootPath")) +
              "\\versions\\" +
              versionObject.name +
              "\\" +
              versionObject.name +
              ".json"
          )
        );
        resolve();
      })
      .catch(reject);
  });
};

const updateConfig = (lastVersions) => {
  return new Promise(async (resolve, reject) => {
    await ConfigManager.setVariable("lastVersions", lastVersions).catch(reject);
    resolve(await ConfigManager.saveConfig().catch(reject));
  });
};

const addLastVersion = (version) => {
  return new Promise(async (resolve, reject) => {
    const lastVersions = await getLastVersions();
    const index = lastVersions.indexOf(version);
    if (index !== -1) {
      lastVersions.splice(index, 1);
      lastVersions.unshift(version);
      await updateConfig(lastVersions);
    } else {
      if (lastVersions.length >= 3) {
        lastVersions.pop();
      }
      lastVersions.unshift(version);
      await updateConfig(lastVersions);
    }
    resolve(lastVersions);
  });
};

const getLastVersions = () => {
  return new Promise(async (resolve, reject) => {
    const versionsList = await ConfigManager.getVariable("lastVersions").catch(
      reject
    );
    if (versionsList) return resolve(versionsList);
    resolve([]);
  });
};

const getVersionNumberByName = (name) => {
  return new Promise(async (resolve, reject) => {
    if (
      fs.existsSync(
        `${await ConfigManager.getVariable(
          "rootPath"
        )}\\versions\\${name}\\${name}.json`
      )
    ) {
      const versionJson = JSON.parse(
        await fs.readFileSync(
          `${await ConfigManager.getVariable(
            "rootPath"
          )}\\versions\\${name}\\${name}.json`
        )
      );
      if (versionJson.inheritsFrom) return resolve(versionJson.inheritsFrom);
      // TODO forge number version from json
      if (versionJson.id) return resolve(versionJson.id);
    }
    resolve(name);
  });
};

// ! tests
(async () => {
  // console.log(await getVersionNumberByName("fabric-loader-0.14.17-1.19.3"));
  //   console.log(await getInstalledVersions());
  //       console.log(await getAvailableVersions("snapshot"));
  //       console.log(await getAvailableVersions("old_alpha"));
  //   const versions = await getAvailableVersions("release");
  //   console.log(versions);
  //   console.log(versions["1.8.9"]);
  //   console.log(await downloadVersionJson(versions["1.8.9"]));
})();

module.exports = {
  getInstalledVersions,
  getAvailableVersions,
  downloadVersionJson,
  addLastVersion,
  getLastVersions,
  getVersionNumberByName,
};
