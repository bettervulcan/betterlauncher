const fs = require("fs");
const path = require("path");

const createIfNotExistDir = (dir) => {
  return new Promise(async (resolve, reject) => {
    if (await fs.existsSync(path.join(dir))) {
      return resolve(path.join(dir) + " exist");
    }
    try {
      const parentDir = path.dirname(path.join(dir));
      if (!(await fs.existsSync(parentDir))) {
        await createIfNotExistDir(parentDir);
      }
      await fs.mkdirSync(path.join(dir));
    } catch (error) {
      return reject(error);
    }
    resolve(path.join(dir) + " created");
  });
};

const createIfNotExistFile = (dir, filename) => {
  return new Promise(async (resolve, reject) => {
    resolve(await writeToFileOrCreate(dir, filename, ""));
  });
};

const writeToFileOrCreate = (dir, filename, content) => {
  return new Promise(async (resolve, reject) => {
    await createIfNotExistDir(dir);
    const filepath = path.join(dir, filename);
    if (await fs.existsSync(filepath)) {
      await fs.writeFile(filepath, content, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve(filepath + " updated");
      });
    }
    try {
      await fs.writeFileSync(filepath, content, { flag: "wx" });
      return resolve(filepath + " created");
    } catch (error) {
      return resolve(error);
    }
  });
};

// ! tests
// (async () => {
//   console.log(await createIfNotExistFile("D:/a/", "b.txt").catch(console.log));
// })();

module.exports = {
  createIfNotExistDir,
  createIfNotExistFile,
  writeToFileOrCreate,
};
