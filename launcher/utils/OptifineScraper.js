const ConfigManager = require("./../managers/ConfigManager");
const FileManager = require("./../managers/FileManager");
const { parse } = require("node-html-parser");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

const OptifineUrl = "https://optifine.net/downloads";

const scrapSite = () => {
  return new Promise((resolve, reject) => {
    axios
      .get(OptifineUrl)
      .then(async (res) => {
        let versions = {};
        await (await parse(res.data))
          .querySelectorAll("td.colMirror > a")
          .forEach((elementHtml) => {
            try {
              const link = elementHtml.getAttribute("href");
              const regex = /OptiFine_([\d.]+)_HD_U_([\w]+)\.jar/g;
              const match = regex.exec(link);
              if (match !== null) {
                const mcVersion = match[1];
                const optifineVersion = match[2];
                if (!versions[mcVersion]) {
                  versions[mcVersion] = [];
                }
                versions[mcVersion][optifineVersion] = {
                  mc: mcVersion,
                  optifine: optifineVersion,
                  link,
                };
              }
            } catch (error) {
              reject(error);
            }
          });
        resolve(versions);
      })
      .catch(reject);
  });
};

const downloadInstaller = (optifineObject, callback) => {
  axios
    .get(optifineObject.link)
    .then(async (res) => {
      axios({
        method: "get",
        url:
          "https://optifine.net/" +
          (await parse(res.data))
            .querySelector("#Download > a")
            .getAttribute("href"),
        responseType: "stream",
      })
        .then(async (response) => {
          FileManager.createIfNotExistDir(
            path.join(
              await ConfigManager.getVariable("rootPath"),
              "Optifines",
              optifineObject.mc.replaceAll(".", "_")
            )
          );
          const optifineJarPath = path.join(
            await ConfigManager.getVariable("rootPath"),
            "Optifines",
            optifineObject.mc.replaceAll(".", "_"),
            optifineObject.optifine + ".jar"
          );
          FileManager.createIfNotExistFile(optifineJarPath);
          await fs.openSync(optifineJarPath, "w");

          const fileStream = fs.createWriteStream(optifineJarPath);
          const fileSize = parseInt(response.headers["content-length"], 10);
          let downloadedSize = 0;
          let startTime = Date.now();

          response.data.on("data", function (chunk) {
            downloadedSize += chunk.length;
            const downloadProgress = (downloadedSize / fileSize) * 100;
            const currentTime = Date.now();
            const downloadSpeed =
              downloadedSize / ((currentTime - startTime) / 1000);
            callback({
              finished: false,
              progrss: downloadProgress.toFixed(2),
              speed: downloadSpeed.toFixed(2),
              downloaded: downloadedSize,
              fileSize,
            });
          });

          response.data.pipe(fileStream);

          fileStream.on("finish", function () {
            const endTime = Date.now();
            const totalTime = (endTime - startTime) / 1000;
            callback({
              finished: true,
              endTime: endTime.toFixed(2),
              totalTime: totalTime.toFixed(2),
              optifineJarPath,
            });
          });

          return optifineJarPath;
        })
        .catch((err) => {
          throw new Error(`Error getting optifine jar.\n${err}`);
        });
    })
    .catch((err) => {
      throw new Error(`Error getting optifine page.\n${err}`);
    });
};

// ! tests
// (async () => {
//   const versions = await scrapSite();
//   console.log(versions["1.19.3"]["I3"]);
//   console.log(await downloadInstaller(versions["1.19.3"]["I3"]));
// })();

module.exports = { scrapSite, downloadInstaller };
