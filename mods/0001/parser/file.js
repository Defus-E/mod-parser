// const extract = require("extract-zip");
const { exec } = require("child_process");
const Directory = require("./directory");
const path = require("path");
const fs = require("fs");

module.exports = class File {
  constructor({ file, src, dest, type }) {
    this.src = src || "";
    this.dest = dest || "";
    this.type = type || "file";
    this.file = Array.isArray(file) ? file : [file];
  }

  mount() {
    for (const file of this.file) {
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

    try {
      if (stat.isDirectory() ) {
        if (this.type === "file") {
          const dir = new Directory(absoluteSourcePath);
          const files = dir.read();

          for (const file of files) {
            exec(`mklink ${destination}\\${file} ${source}\\${file}`, err =>
              err ? console.error(err) : null);
          }
        } else {

        }
      } else {
        exec(`mklink ${destination}\\${file} ${source}`, err =>
          err ? console.error(err) : null);
      }
    } catch (e) {
      throw e;
    }
  }

  _move() {
    const { source, destination } = File._normalizePaths(this.file, this.src, this.dest);
    const destFile = path.join(destination, this.file);

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
    const { source } = File._normalizePaths(this.file, this.src);
    fs.unlinkSync(source);
  }

  // async extract() {
  //   const { source, destination } = await File._normalizePaths(this.file, this.src, this.dest);
  //   await extract(source, { dir: destination });
  // }

  static _normalizePaths(file, src, dest) {
    const modId = (__dirname.match(/(?<=mods(\/|\\)).+?((\\|\/)|$)/) || [])[0];
    const KLD = (__dirname.match(/^.+\\(?=mods)/) || [])[0];

    if (/^\$mod(\\|\/)?$/.test(src)) {
      src = path.join(KLD, "mods", src.replace("$mod", modId), file);
    } else if (/^\$engine(\\|\/)?$/.test(src)) {
      src = path.join(KLD, "engines", src.replace("$engine", modId), file);
    }

    dest = /^\$game(\\|\/)?$/.test(dest) ? path.join(KLD, "game") : dest;

    return [
      path.relative(process.cwd(), src),
      path.relative(process.cwd(), dest)
    ];
  }
}
