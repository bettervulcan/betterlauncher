const ConfigManager = require("./ConfigManager");
const FileManager = require("./FileManager");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

let cache = undefined;

const VersionManifest =
  "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json"; //,ForgeManifest = "",  FabricManifest = "";

const cacheVersions = async () => {
  cache = await axios.get(VersionManifest);
};

const getInstalledVersions = async () => {
  try {
    if (
      !(await fs.existsSync(
        path.join(await ConfigManager.getVariable("rootPath"), "versions")
      ))
    )
      return [];
    const versions = (
      await fs.readdirSync(
        path.join(await ConfigManager.getVariable("rootPath"), "versions"),
        { withFileTypes: true }
      )
    )
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
    return versions;
  } catch (error) {
    throw new Error(`Error getting installed versions.`);
  }
};

const isVersionInstalled = async (version) => {
  return (await getInstalledVersions()).includes(version);
};

const getAvailableVersions = async (type) => {
  try {
    let res;
    if (cache) {
      res = cache;
    } else {
      res = await axios.get(VersionManifest);
    }

    let versionList = [];
    res.data.versions.forEach((version) => {
      if (version.type != type) return;
      versionList[version.id] = { name: version.id, url: version.url };
    });
    return versionList;
  } catch (error) {
    throw new Error(`Error getting avalible ${type} versions.\n${error}`);
  }
};

const downloadVersionJson = (versionObject) => {
  axios({
    method: "get",
    url: versionObject.url,
    responseType: "stream",
  })
    .then(async (response) => {
      await FileManager.createIfNotExistFile(
        path.join(
          (await ConfigManager.getVariable("rootPath")) + "versions",
          versionObject.name,
          versionObject.name + ".json"
        )
      );
      await response.data.pipe(
        fs.createWriteStream(
          path.join(
            await ConfigManager.getVariable("rootPath"),
            "versions",
            versionObject.name,
            versionObject.name + ".json"
          )
        )
      );
      return;
    })
    .catch(() => {
      throw new Error(`Error downloading ${versionObject.url}`);
    });
};

const updateConfig = async (lastVersions) => {
  await ConfigManager.setVariable("lastVersions", lastVersions);
  return await ConfigManager.saveConfig();
};

const addLastVersion = async (version) => {
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
  return lastVersions;
};

const getLastVersions = async () => {
  // TODO check if version exist
  try {
    const versionsList = await ConfigManager.getVariable("lastVersions");
    if (versionsList) {
      return versionsList;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
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
  cacheVersions,
  getInstalledVersions,
  isVersionInstalled,
  getAvailableVersions,
  downloadVersionJson,
  addLastVersion,
  getLastVersions,
};
