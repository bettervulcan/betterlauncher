// TODO IT WILL DOWNLAD JAVA, CHECK LOCATION AND RUN JAR
const process = require("child_process");
const path = require("path");
const os = require("os");

const getJavaExecPath = () => {
  if (os.platform() == "win32") {
    process.exec("where java", (err, stdout) => {
      if (err) {
        console.log(err);
        throw new Error(`Error runnin java command.\n${err}`);
      }
      if (stdout === "INFO: Could not find files for the given pattern(s).")
        throw new Error("No java avalible");
      if (stdout.includes("\n")) {
        return stdout.split("\n")[0];
      }
      return stdout;
    });
  } else if (os.platform() == "linux") {
    process.exec("which java", (err, stdout) => {
      if (err) {
        console.log(err);
        throw new Error(`Error runnin java command.\n${err}`);
      }
      if (stdout.includes("not found")) throw new Error("No java avalible");
      if (stdout.includes("\n")) {
        return stdout.split("\n")[0];
      }
      return stdout;
    });
  }
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
