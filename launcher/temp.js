const { Client } = require("minecraft-launcher-core");
const { auth } = require("msmc");

const launcher = new Client();
const authManager = new auth("select_account");

authManager.launch("electron").then(async (xboxManager) => {
  const token = await xboxManager.getMinecraft();
  let opts = {
    clientPackage: null,
    authorization: token.mclc(),
    root: "./.minecraft",
    version: {
      number: "1.8.9",
      type: "release",
    },
    memory: {
      max: "6G",
      min: "4G",
    },
  };
  console.log("Starting!");
  launcher.launch(opts);

  launcher.on("debug", (e) => console.log(e));
  launcher.on("data", (e) => console.log(e));
});
