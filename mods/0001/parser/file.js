// const extract = require("extract-zip");
const Directory = require("./directory");
const path = require("path");
const fs = require("fs");

const { mklink } = require("./commander");

module.exports = class File {
  constructor({ file, src, dest }) {
    this.src = src || "";
    this.dest = dest || "";
    this.filename = Array.isArray(file) ? file : [file];
  }

  mount() {
    for (const file of this.filename) {
      this._mount(file);
    }
  }

  move() {
    this._move();
  }

  delete() {
    this._delete();
  }

  _mount(file) {
    const [source, destination] = File._normalizePaths(
      file,
      this.src,
      this.dest
    );

    const absoluteSourcePath = path.join(__dirname, path.relative(__dirname, source));
    const stat = fs.lstatSync(absoluteSourcePath);

    if (stat.isDirectory()) {
      const dir = new Directory(absoluteSourcePath);
      const { files, folders } = dir.read();

      for (const dirFile of files) {
        // console.log(this.dest, `${source}\\${dirFile}`, `${destination}\\${dirFile}`);
        mklink(`${source}\\${dirFile}`, `${destination}\\${dirFile}`);
      }

      for (const folder of folders) {
        let pathToFolder = path.join(destination, folder);

        Directory.makeDir(pathToFolder);

        this.dest = path.join(this.dest, folder);
        this._mount(path.join(file, folder));
      }

      this.dest = this.dest.split(/\\|\//).length <= 1 ? this.dest : this.dest
        .split(/\\|\//)
        .slice(0, -1)
        .join("\\");
    } else {
      mklink(source, `${destination}\\${file}`);
    }
  }

  _move() {
    const { source, destination } = File._normalizePaths(this.filename, this.src, this.dest);
    const destFile = path.join(destination, this.filename);

    try {
      fs.renameSync(source, destFile);
    } catch (error) {
      const readStream = fs.createReadStream(source);
      const writeStream = fs.createWriteStream(destFile);

      readStream.on("error", callback);
      writeStream.on("error", callback);

      readStream.on("close", async () =>
        await fs.unlinkSync(source));

      readStream.pipe(writeStream);

      function callback(error) {
        console.error(error);
        writeStream.close();
        readStream.close();
      }
    }
  }

  _delete() {
    const { source } = File._normalizePaths(this.filename, this.src, path.join(this.src, this.filename + ".rm"));
    const destFile = path.join(destination, this.filename);

    fs.renameSync(source, destFile);
  }

  static _normalizePaths(file, src, dest) {
    const modId = (__dirname.match(/(?<=mods(\/|\\)).+?((\\|\/)|$)/) || [])[0];
    const KLD = (__dirname.match(/^.+\\(?=mods)/) || [])[0];

    if (/^\$mod(\\|\/)?/.test(src)) {
      src = path.join(KLD, "mods", src.replace("$mod", modId), file);
    } else if (/^\$engine(\\|\/)?/.test(src)) {
      src = path.join(KLD, "engines", src.replace("$engine", modId), file);
    }

    dest = /^\$game(\\|\/)?/.test(dest) ? path.join(KLD, dest.replace("$game", "game")) : dest;

    return [
      path.relative(process.cwd(), src),
      path.relative(process.cwd(), dest)
    ];
  }
}
