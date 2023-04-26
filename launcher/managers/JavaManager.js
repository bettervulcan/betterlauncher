// TODO IT WILL DOWNLAD JAVA, CHECK LOCATION AND RUN JAR
const os = require("os");
const process = require("child_process");
const ConfigManager = require("./ConfigManager");

const getJavaExec = () => {
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
    } else {
    }
  });
};

// ! test
(async () => {
  console.log(await getJavaExec());
})();
