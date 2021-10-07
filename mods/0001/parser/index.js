const path = require("path");
const App = require("./app");

new App({
  modFilePath: path.join(__dirname, "..", "mod.json")
});
