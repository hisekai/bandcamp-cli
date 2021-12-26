const meow = require("meow");
const helpText = require("./help/helpText");

const options = {
  flags: {
    username: {
      type: "string",
      alias: "u",
    },
    destination: {
      type: "string",
      alias: "d",
    },
    format: {
      type: "string",
      alias: "f",
    },
    last: {
      type: "number",
      alias: "l",
    },
    artist: {
      type: "string",
      alias: "a",
      isMultiple: true,
    },
    artists: {
      type: "string",
      alias: "A",
    },
    title: {
      type: "string",
      alias: "t",
      isMultiple: true,
    },
    titles: {
      type: "string",
      alias: "T",
    },
    rename: {
      type: "string",
      alias: "r",
    },
  },
  description: false,
};

module.exports = meow(helpText, options);
