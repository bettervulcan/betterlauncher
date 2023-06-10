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
        return path.join(output.split("\n")[0]);
      }
      return path.join(output);
    } catch (err) {
      throw new Error(`Error running java command.\n${err}`);
    }
  } else if (os.platform() == "linux") {
    try {
      const output = process.execSync("which java").toString();
      if (output.includes("not found")) throw new Error("No java avalible");
      if (output.includes("\n")) {
        return path.join(output.split("\n")[0]);
      }
      return path.join(output);
    } catch (err) {
      throw new Error(`Error running java command.\n${err}`);
    }
  }
};

const executeJar = async (jarPath, javaArgs = "", cb = () => {}) => {
  console.log(
    "Running",
    jarPath,
    " with java ",
    await getJavaExecPath(),
    " with arguments {",
    javaArgs,
    "}"
  );
  const java = process.exec(
    `"${path.join(await getJavaExecPath())}" -jar ${path.join(
      jarPath
    )} ${javaArgs}`,
    { detached: true }
  );
  java.unref();
  java.on("exit", () => {
    cb({ exited: true });
  });
};

// ! test
// (async () => {
//   console.log(path.join(await getJavaExecPath()));
// })();

module.exports = { getJavaExecPath, executeJar };
