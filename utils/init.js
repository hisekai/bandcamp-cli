const welcome = require("cli-welcome");
const pkg = require("./../package.json");

module.exports = () => {
  welcome({
    title: `bandcamp-cli`,
    tagLine: `by kirea`,
    description: pkg.description,
    version: pkg.version,
    bgColor: "#629aa9",
    color: "#ffffff",
    bold: true,
  });
};
