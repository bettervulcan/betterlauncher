const ConfigManager = require("./../managers/ConfigManager");
const { parse } = require("node-html-parser");
const axios = require("axios");
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

const downloadInstaller = (optifineObject) => {
  return new Promise((resolve, reject) => {
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
            if (
              !(await fs.existsSync(
                (await ConfigManager.getVariable("rootPath")) + "\\Optifines\\"
              ))
            ) {
              await fs.mkdirSync(
                (await ConfigManager.getVariable("rootPath")) + "\\Optifines\\"
              );
            }
            if (
              !(await fs.existsSync(
                (await ConfigManager.getVariable("rootPath")) +
                  "\\Optifines\\" +
                  optifineObject.mc.replaceAll(".", "_")
              ))
            ) {
              await fs.mkdirSync(
                (await ConfigManager.getVariable("rootPath")) +
                  "\\Optifines\\" +
                  optifineObject.mc.replaceAll(".", "_")
              );
            }
            if (
              !(await fs.existsSync(
                (await ConfigManager.getVariable("rootPath")) +
                  "\\Optifines\\" +
                  optifineObject.mc.replaceAll(".", "_") +
                  "\\" +
                  optifineObject.optifine +
                  ".jar"
              ))
            ) {
              await fs.openSync(
                (await ConfigManager.getVariable("rootPath")) +
                  "\\Optifines\\" +
                  optifineObject.mc.replaceAll(".", "_") +
                  "\\" +
                  optifineObject.optifine +
                  ".jar",
                "w"
              );
            } else {
              return resolve();
            }
            response.data.pipe(
              fs.createWriteStream(
                (await ConfigManager.getVariable("rootPath")) +
                  "\\Optifines\\" +
                  optifineObject.mc.replaceAll(".", "_") +
                  "\\" +
                  optifineObject.optifine +
                  ".jar"
              )
            );
            // TODO: RUN IT BY JAVA MANAGER
            return resolve("TODO: RUN IT BY JAVA MANAGER");
          })
          .catch((err) => {
            return reject(err);
          });
      })
      .catch((err) => {
        return reject(err);
      });
  });
};

// ! tests
(async () => {
  const versions = await scrapSite();
  console.log(versions["1.19.3"]["I3"]);
  console.log(await downloadInstaller(versions["1.19.3"]["I3"]));
})();

module.exports = { scrapSite, downloadInstaller };
