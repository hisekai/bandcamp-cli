const { green, yellow, cyan, dim, italic, magenta } = require("chalk");

const helpText = `
  Usage
      ${green(`bandcamp-cli`)} ${yellow(`[--options]`)} ${cyan(`<command>`)}

  ${yellow(`Options`)}
      --username,          -u                               Your Bandcamp username (${magenta(
        `required`
      )})
      --destination,       -d                               The directory where files are going to be downloaded to (${dim(
        `default: Music`
      )})
      --format,            -f                               The format in which to download files (${dim(
        `default: flac, available: mp3, mp3_320, flac, aac, ogg, alac, wav, aiff`
      )})
      --last,              -l                               The last number of albums to download
      --artist,            -a                               Downloads albums with the exact artist name (case insensitive, can be multiple)
      --artists,           -A                               Downloads albums where the artist's name is included, useful for album splits (case insensitive)
      --title,             -t                               Downloads albums with the exact title name (case sensitive, can be multiple)
      --titles,            -T                               Downloads albums with titles that contain the provided value (case insensitive)
      --rename,            -r                               Renames the band/artist's name to the value specified

  ${cyan(`Commands`)}
        help                                                Show help text for bandcamp-cli

  Examples
        bandcamp-cli -u ${italic(
          "username"
        )}                            Downloads the entire Bandcamp collection
        bandcamp-cli -u ${italic(
          "username"
        )} -l 3                       Downloads the last 3 albums from the collection
        bandcamp-cli -u ${italic("username")} -a ${italic(
  "myfavartist"
)}             Downloads albums by the artist myfavartist from the collection
        bandcamp-cli -u ${italic("username")} -a ${italic("band1")} -a ${italic(
  "band2"
)}          Downloads albums by the artist "band1" and "band2" from the collection
        bandcamp-cli -u ${italic("username")} -d ${italic(
  "MyFolder"
)}                Downloads the collection to a directory MyFolder
`;

module.exports = helpText;
