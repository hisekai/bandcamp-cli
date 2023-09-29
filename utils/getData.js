const waitTillHTMLRendered = require("./waitUntilHTMLRendered");
const puppeteer = require('puppeteer-extra');
const Stealth = require('puppeteer-extra-plugin-stealth');
const userAgent = require("user-agents");
puppeteer.use(Stealth());

async function getData(username, password) {
  let collection;
  let profile;
  try {
    const browser = await puppeteer.launch({ headless: false});
    const page = await browser.newPage();
    await page.setUserAgent(userAgent.toString());
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto("https://bandcamp.com/login", {
      waitUntil: "load",
      timeout: 0,
    });
    await page.type("#username-field", username);
    await page.type("#password-field", password);
    await page.click("button");
    await page.waitForNavigation();
    let button = (await page.$(".show-more")) || "";
    if (button) {
      await page.click(".show-more");
    }
    console.log("Reached the profile page, collecting data...");
    await page.evaluate(() => {
      let scrollTop = -1;
      const interval = setInterval(() => {
        window.scrollBy(0, 100);
        if (document.documentElement.scrollTop !== scrollTop) {
          scrollTop = document.documentElement.scrollTop;
          return;
        }
        clearInterval();
      }, 10);
    });
    // make sure all of the page is scrolled to the bottom before scraping data
    await waitTillHTMLRendered(page);
    // get the collection
    try {
      collection = await page.$$eval(".collection-item-container", (els) => {
        const albums = els.map((el) => {
          const title = el.querySelector(".collection-item-title").innerText;
          const artist = el
            .querySelector(".collection-item-artist")
            .innerText.replace("by ", "");
          const art = el.querySelector(".collection-item-art").src;
          const downloadLink = el.querySelector(".redownload-item > a").href;
          return { title, artist, art, downloadLink };
        });
        return albums;
      });
    } catch (err) {
      console.error(err);
    }
    // get the profile data
    try {
      profile = await page.$$eval(".fan-container", (els) => {
        const info = els.map((el) => {
          const name = el.querySelector(".name h1 span")
            ? el.querySelector(".name h1 span").innerText
            : null;
          const location = el.querySelector("div.info > ol > li:nth-child(1)")
            ? el.querySelector("div.info > ol > li:nth-child(1)").innerText
            : null;
          const collectionNum = el.querySelector(
            "#grid-tabs > li.active > span > span"
          )
            ? el.querySelector("#grid-tabs > li.active > span > span").innerText
            : null;
          const wishlistNum = el.querySelector(
            "#grid-tabs > li:nth-child(2) > span > span"
          )
            ? el.querySelector("#grid-tabs > li:nth-child(2) > span > span")
                .innerText
            : null;
          return { name, location, collectionNum, wishlistNum };
        });
        return info;
      });
    } catch (err) {
      console.error(err);
    }
    browser.close();
    return { profile, collection };
  } catch (err) {
    console.log(err);
  }
}

module.exports = getData;
