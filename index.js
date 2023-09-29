#!/usr/bin/env node

const os = require("os");
const path = require("path");
const init = require("./utils/init");
const cli = require("./utils/cli");
const prompts = require("prompts");
const getData = require("./utils/getData");
const displayProfile = require("./utils/displayProfile");
const downloadFiles = require("./utils/downloadFiles");
const formats = require("./utils/formats");

const input = cli.input;
const flags = cli.flags;

const homeDir = os.homedir();

// main();
(async () => {
  init();
  input.includes(`help`) && cli.showHelp(0);
  const password = await prompts({
    type: "password",
    name: "value",
    message: "Please enter a password.",
    validate: (value) =>
      value.length === 0 ? `Password can't be blank` : true,
  });
  console.log(); // just for padding
  if (flags.username && password) {
    // flags
    const username = flags.username;
    const destination = flags.destination || "Music";
    const downloadPath = path.resolve(path.join(homeDir, destination));
    const format = flags.format || "flac"; // mp3, mp3_320, flac, aac, ogg, alac, wav, aiff
    const artist = flags.artist || [];
    const artists = flags.artists || null;
    const title = flags.title || [];
    const titles = flags.titles || null;
    const last = flags.last || null;
    const rename = flags.rename || null;
    // try to fetch data
    let { profile, collection } = await getData(username, password.value);

    // check for flags
    if (format) {
      let result = formats.map(f => f.flag);
      if (!result.includes(format)) {
        console.log("The format you've specified is not available.");
        return;
      }
    }
    if (artists)
      collection = collection.filter((album) =>
        album.artist.toLowerCase().includes(artists.toLowerCase())
      );
    if (artist.length > 0)
      collection = collection.filter((album) =>
        artist.map((a) => a.toLowerCase()).includes(album.artist.toLowerCase())
      );
    if (titles)
      collection = collection.filter((album) =>
        album.title.toLowerCase().includes(titles.toLowerCase())
      );
    if (title.length > 0)
      collection = collection.filter((album) => title.includes(album.title));
    // if have data display profile
    profile !== "undefined" && displayProfile(profile[0]);
    // if have data ask if the user wants to download n number of albums
    if (collection.length > 0) {
      const response = await prompts({
        type: "confirm",
        name: "value",
        message: `Do you want to download ${
          last ? last : collection.length
        } album(s) to ${downloadPath}?`,
        initial: true,
      });
      if (response.value === true) {
        await downloadFiles(collection, format, downloadPath, last, rename);
      } else {
        console.log("Ok. Bye.");
      }
    } else {
      console.log("You don't have any albums to download.");
    }
  } else {
    console.log("Username and password are required.");
  }
})();
