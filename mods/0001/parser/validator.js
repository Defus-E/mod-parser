const { readFileSync } = require("fs");

module.exports = class Validator {
  static run(path) {
    try {
      const content = JSON.parse(readFileSync(path, "utf-8"));
      const { engine, init, rules, options, run } = content;

      this.validateEngine(engine);
      this.validateInitProp(init);
      this.validateOptions(options);

      return content;
    } catch (e) {
      console.error("An error occurred while parsing json.\n", e);
    }
  }

  static validateEngine(engine) {
    if (!/^\d+\:\d+\.\d{4}$/.test(engine)) {
      throw new Error("The property `engine` is not valid. Please, read documentation to learn more.");
    }
  }

  static validateInitProp(initActs) {
    if (Array.isArray(initActs)) {
      if (initActs.filter(el => (
        typeof el === "object" &&
        !Array.isArray(el) &&
        el !== null
      )).length !== initActs.length) {
        throw new Error("The property `init` must be an array.");
      }

      initActs.forEach(el => {
        switch (true) {
          case typeof el.src !== "string":
            throw new Error("The property `init`.`src` must be a string.")
            break
          case typeof el.dest !== "string":
            throw new Error("The property `init`.`dest` must be a string.")
            break
          case (!["mount", "extract", "move", "delete"].includes(el.action)):
            throw new Error("Provided action type was not found. Please, read documentation to learn more.")
            break
          case typeof el.file !== "string":
            if (Array.isArray(el.file)) {
              if (el.file.filter(e => typeof e === "string").length !== el.file.length) {
                throw new Error("The property `init`.`file` must be a string or an array of strings.")
              }
            } else {
              throw new Error("The property `init`.`file` must be a string or an array of strings.")
            }
        }
      });
    } else {
      throw new Error("The property `init` must be an array.");
    }
  }

  static validateOptions(options) {
    if (!options) throw new Error("The property `options` was not provided.");
    else if (typeof options !== "object" || Array.isArray(options))
      throw new Error("Type of the `options` property should be an object.");

    let optionsToCheck = ["splash", "custom", "app"];
    let errors = [];

    optionsToCheck
      .sort()
      .forEach(opt => {
        if (options[opt] === null || options[opt] === undefined) {
          errors.push(`Option \`${opt}\` must be provided. Please, read documentation to learn more.`);
        }

        if (typeof options[opt] !== "boolean") {
          errors.push(`Option \`${opt}\` must be a boolean type. Please, read documentation to learn more.`);
        }
      });

    if (errors.length !== 0)
      throw new Error(errors[0]);
  }
}
