const fs = require("fs");
const path = require("path");
const { on } = require("stream");
const request = require("request");
const admZip = require("adm-zip");
const cliProgress = require("cli-progress");
const formats = require("./formats");
const puppeteerExtra = require('puppeteer-extra');
const Stealth = require('puppeteer-extra-plugin-stealth');

puppeteerExtra.use(Stealth());

const downloadFiles = async (albums, format, downloadPath, last, rename) => {
  const multibar = new cliProgress.MultiBar(
    {
      clearOnComplete: false,
      hideCursor: true,
      forceRedraw: true,
      format:
        "downloading {title} by {artist} [{bar}] {percentage}% | ETA: {eta}s",
      fps: 5,
      stopOnComplete: true,
    },
    cliProgress.Presets.legacy
  );
  if (last) albums = albums.splice(0, last);
  const targetFormat = formats.filter(f => {
    return f.flag === format
  });
  albums.map(async (album) => {
    try {
      const browser = await puppeteerExtra.launch({headless: false});
      const page = await browser.newPage();
      await page.goto(album.downloadLink);
      await page.waitForTimeout(1000);
      await page.click(".bc-select");
      await page.select('#format-type', targetFormat[0].format);
      await page.waitForSelector('.download-button', {
        visible: false,
      });
      const link = await page.$eval(".download-format-tmp > a:nth-child(5)", (el) => el.href);
      // // download and extraction
      const zipFile = path.join(downloadPath, `${album.title}.zip`);
      const file = fs.createWriteStream(zipFile);
      request(link)
        .on("response", function (res) {
          const totalBytes = res.headers["content-length"];
          let receivedBytes = 0;
          const bar = multibar.create(totalBytes, 0, {
            title: album.title,
            artist: album.artist,
          });
          res.on("data", function (chunk) {
            receivedBytes += chunk.length;
            bar.update(receivedBytes);
          });
        })
        .pipe(file)
        .on("finish", function (file) {
          multibar.update();
        })
        .on("close", function () {
          const zip = new admZip(zipFile);
          zip.extractAllTo(
            path.join(
              downloadPath,
              path.join(rename ? rename : album.artist, album.title)
            ),
            false
          ); // target path & overwrite (default: false)
          fs.unlinkSync(zipFile); // remove the zip file
        });
      browser.close();
    } catch (err) {
      console.log(err);
    }
  });
};

module.exports = downloadFiles;
