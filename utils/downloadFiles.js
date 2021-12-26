const fs = require("fs");
const path = require("path");
const { on } = require("stream");
const puppeteer = require("puppeteer");
const request = require("request");
const admZip = require("adm-zip");
const cliProgress = require("cli-progress");
const formats = require("./formats");

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
  const target = `#post-checkout-info div.formats-container ul > li:nth-child(${
    formats.indexOf(format) + 1
  })`;
  console.log();
  albums.map(async (album) => {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(album.downloadLink);
      await page.waitForTimeout(1000);
      await page.click(".item-format");
      await page.click(target);
      await page.waitForSelector(
        "div.free-download.download > div.format-container > span > a",
        {
          visible: true,
        }
      ); // make sure the link is ready beforing clicking on it
      await page.waitForTimeout(2000);
      // get the link
      await page.waitForSelector(".download-title a");
      await page.waitForTimeout(2000);
      const link = await page.$eval(".download-title a", (el) => el.href);
      // download and extraction
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
