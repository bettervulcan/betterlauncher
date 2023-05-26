// TODO IT WILL DOWNLAD JAVA, CHECK LOCATION AND RUN JAR
const process = require("child_process");
const path = require("path");
const os = require("os");

const getJavaExecPath = () => {
  if (os.platform() == "win32") {
    try {
      const output = process.execSync("where java").toString();
      if (output === "INFO: Could not find files for the given pattern(s).\n")
        throw new Error("No java avalible");
      if (output.includes("\n")) {
        return output.split("\n")[0];
      }
      return output;
    } catch (err) {
      throw new Error(`Error running java command.\n${err}`);
    }
  } else if (os.platform() == "linux") {
    try {
      const output = process.execSync("which java").toString();
      if (output.includes("not found")) throw new Error("No java avalible");
      if (output.includes("\n")) {
        return output.split("\n")[0];
      }
      return output;
    } catch (err) {
      throw new Error(`Error running java command.\n${err}`);
    }
  }
};

const executeJar = async (jarPath, javaArgs = "") => {
  console.log(
    `Running ${jarPath} with java ${await getJavaExecPath()} with arguments {${javaArgs}}`
  );
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
(async () => {
  console.log(await getJavaExecPath());
})();

module.exports = { getJavaExecPath, executeJar };
