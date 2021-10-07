const Validator = require("./validator");
const Directory = require("./directory");
const File = require("./file");

module.exports = class App {
  constructor({ modFilePath }) {
    this.pathToFile = modFilePath;

    this.init();
  }

  init() {
    const content = Validator.run(this.pathToFile);
    const { engine, options, init: initActions, run } = content;

    this.runOptions = options;
    this.patchId = engine.split(":")[1];

    this.prepareEngine();
    this.parseActions(initActions);
    // this.executeGame(run);
  }

  prepareEngine() {
    Directory.makeDir("$game");

    const engineDb = new File({
      type: "folder",
      file: "db/ru",
      src: "$engine",
      dest: "$game"
    });

    engineDb.mount();
    console.log("Engine files were successfully mounted!");

    const patch = new File({
      type: "file",
      file: [`patch/ru/${this.patchId}`, "fsgame.ltx", "stalker.ico"],
      src: "$engine",
      dest: "$game"
    });

    patch.mount();
    console.log("Patch files were successfully mounted!");
  }

  parseActions(actions) {
    actions.forEach(({ action, ...actionObj }) => {
      const file = new File(actionObj);

      file[action]();
      console.log(`Action \`${action}\` was successfully executed upon ${file}`);
    });
  }

  executeGame(pathToGame) {
    console.log(this.runOptions, pathToGame);
  }
}
