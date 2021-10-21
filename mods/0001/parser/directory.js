const { mkdirSync, readdirSync } = require("fs");
const { join } = require("path");

module.exports = class Directory {
  constructor(dir) {
    this.dir = dir;
  }

  read() {
    return this._read(this.dir);
  }

  _read(dir) {
    const dirElements = (readdirSync(dir, { withFileTypes: true }));
    const onlyFiles = dirElements
      .filter(elem => elem.isFile())
      .map(f => f.name);

    const onlyFolders = dirElements
      .filter(elem => elem.isDirectory())
      .map(f => f.name);

    return {
      files: onlyFiles,
      folders: onlyFolders,
    };
  }

  static makeDir(dirPath) {
    if (/^\$game$/.test(dirPath)) {
      dirPath = join(__dirname, "../../..", "game");
    }

    mkdirSync(dirPath, { recursive: true });
  }
}
