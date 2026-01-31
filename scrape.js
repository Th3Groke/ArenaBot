import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

const ADDRESS = "https://prezeroarenagliwice.pl/wydarzenia/";

async function scrape() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  console.log("connecting to the page...");
  await page.goto(ADDRESS, { waitUntil: "networkidle2" });
  const events = await page.evaluate(() => {
    const data = [];

    const eventCards = document.querySelectorAll(".event");

    eventCards.forEach((card) => {
      const titleEl = card.querySelector("h4.loop-box-h4");
      const dateEl = card.querySelector("h6.loop-box-h6");

      if (titleEl && dateEl) {
        data.push({
          title: titleEl.innerText.trim(),
          date: dateEl.innerText.trim(),
        });
      }
    });
    return data;
  });
  console.log("scraped website. Found: " + events.length + " events. ");
  console.log(events);
  await browser.close();
  return events;
}
export const scrapedData = await scrape();
