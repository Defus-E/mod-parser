const { mkdirSync, readdirSync } = require("fs");
const { join } = require("path");

module.exports = class Directory {
  constructor(dir) {
    this.dir = dir;
  }

  read(dir = this.dir, allFiles = []) {
    const dirElements = (readdirSync(dir, { withFileTypes: true }));
    const onlyFiles = dirElements
      .filter(elem => elem.isFile())
      .map(f => join(dir, f.name));

    const onlyFolders = dirElements
      .filter(elem => elem.isDirectory())
      .map(f => join(dir, f.name));

    allFiles.push(...onlyFiles);

    onlyFolders.map(f =>
      this.read(f, allFiles))

    return allFiles.map(file => file.split(/(\\|\/)/).pop());
  }

  static makeDir(dirPath) {
    if (/^\$game$/.test(dirPath)) {
      dirPath = join(__dirname, "../../..", "game");
    }

    mkdirSync(dirPath, { recursive: true });
  }
}
