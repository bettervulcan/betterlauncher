// TODO IT WILL DOWNLAD JAVA, CHECK LOCATION AND RUN JAR
const process = require("child_process");
const path = require("path");
const os = require("os");

const getJavaExecPath = () => {
  return new Promise((resolve, reject) => {
    if (os.platform() == "win32") {
      process.exec("where java", (err, stdout, stderr) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        if (stdout === "INFO: Could not find files for the given pattern(s).")
          return reject("no java");
        if (stdout.includes("\n")) {
          return resolve(stdout.split("\n")[0]);
        }
        resolve(stdout, stderr);
      });
    } else if (os.platform() == "linux") {
      process.exec("which java", (err, stdout, stderr) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        if (stdout.includes("not found")) return reject("no java");
        if (stdout.includes("\n")) {
          return resolve(stdout.split("\n")[0]);
        }
        resolve(stdout, stderr);
      });
    }
  });
};

const executeJar = async (jarPath, javaArgs = "") => {
  process
    .exec(
      `"${path.join(await getJavaExecPath())}" -jar ${path.join(
        jarPath
      )} ${javaArgs}`,
      { detached: true }
    )
    .unref();
};

// ! test
// (async () => {
//   console.log(await getJavaExec());
// })();

module.exports = { getJavaExecPath, executeJar };
