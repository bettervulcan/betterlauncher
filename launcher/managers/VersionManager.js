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
      .catch((err) => {
        reject(err);
      });
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
      .catch((err) => {
        reject(err);
      });
  });
};

// ! tests
// (async () => {
//   console.log(await getInstalledVersions());
//       console.log(await getAvailableVersions("snapshot"));
//       console.log(await getAvailableVersions("old_alpha"));
//   const versions = await getAvailableVersions("release");
//   console.log(versions);
//   console.log(versions["1.8.9"]);
//   console.log(await downloadVersionJson(versions["1.8.9"]));
// })();

module.exports = {
  getInstalledVersions,
  getAvailableVersions,
  downloadVersionJson,
};
