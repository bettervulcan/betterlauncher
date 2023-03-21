const fs = require("fs");
const ConfigManager = require("./ConfigManager");

var accounts = {};

const loadAccounts = async () => {
  accounts = JSON.parse(
    await fs.readFileSync(
      (await ConfigManager.getVariable("rootPath")) + "\\launcher_profiles.json"
    )
  );
};

// ! tests
// (async () => {
//   await loadAccounts();
//   console.log(accounts);
// })();
