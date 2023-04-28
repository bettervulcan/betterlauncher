const fs = require("fs");
const path = require("path");
const ConfigManager = require("./ConfigManager");
const FileManager = require("./FileManager");

var accounts = { accounts: [], lastAccount: "" };

const saveAccounts = () => {
  return new Promise(async (resolve, reject) => {
    try {
      FileManager.createIfNotExistDir(
        path.join(await ConfigManager.getVariable("rootPath"), "better")
      );
      const accountsJSON = JSON.stringify({
        accounts: Object.values(accounts.accounts),
        lastAccount: accounts.lastAccount,
      });
      await FileManager.writeToFileOrCreate(
        path.join(await ConfigManager.getVariable("rootPath"), "better"),
        "accounts.json",
        JSON.stringify(JSON.parse(accountsJSON), null, 2)
      );
      console.log(
        `Accounts saved successfuly to ${path.join(
          await ConfigManager.getVariable("rootPath"),
          "better",
          "accounts.json"
        )}`
      );
      return resolve(accounts);
    } catch (error) {
      console.error(error);
      return reject(error);
    }
  });
};

const loadAccounts = () => {
  return new Promise(async (resolve, reject) => {
    if (!(await isAccountsExist())) {
      console.log("Accounts doesnt exist");
      return resolve(await saveAccounts());
    }
    try {
      accounts = JSON.parse(
        await fs.readFileSync(
          path.join(
            await ConfigManager.getVariable("rootPath"),
            "better",
            "accounts.json"
          )
        )
      );
      console.log(
        `Accounts loaded successfuly from ${path.join(
          await ConfigManager.getVariable("rootPath"),
          "better",
          "accounts.json"
        )}`
      );
      return resolve(accounts);
    } catch (error) {
      console.error(error);
      return reject(error);
    }
  });
};

const isAccountsExist = () => {
  return new Promise(async (resolve, reject) => {
    try {
      return resolve(
        await fs.existsSync(
          path.join(
            await ConfigManager.getVariable("rootPath"),
            "better",
            "accounts.json"
          )
        )
      );
    } catch (error) {
      return reject(err);
    }
  });
};

const isNewAccount = (accountObj) => {
  return new Promise((resolve, reject) => {
    accounts.accounts.forEach((account) => {
      if (account.uuid === accountObj.uuid) resolve(false);
    });
    resolve(true);
  });
};

const addAccount = (accountObj) => {
  return new Promise(async (resolve, reject) => {
    if (await isNewAccount(accountObj)) {
      await accounts.accounts.push(accountObj);
    } else {
      console.log(accountObj.name, "already exist");
    }
    resolve(await saveAccounts());
  });
};

const getAccountsList = () => {
  return new Promise((resolve, reject) => {
    resolve(accounts);
  });
};

const getAccountByUUID = (uuid) => {
  return new Promise((resolve, reject) => {
    accounts.accounts.forEach((account) => {
      if (account.uuid === uuid) resolve(account);
    });
    reject(`account ${uuid} doesnt exist`);
  });
};

const setLastAccount = (uuid) => {
  return new Promise(async (resolve, reject) => {
    accounts.lastAccount = uuid;
    resolve(await saveAccounts());
  });
};

// ! tests
// (async () => {
//   await loadAccounts();
//   console.log(accounts);
// })();

module.exports = {
  loadAccounts,
  saveAccounts,
  addAccount,
  getAccountsList,
  getAccountByUUID,
  setLastAccount,
};
