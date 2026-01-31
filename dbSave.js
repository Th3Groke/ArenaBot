import Database from "better-sqlite3";
import { scrapedData } from "./scrape.js";
import { Event, Months } from "./consts.js";

const db = new Database("events.sqlite");
db.prepare(
  "CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, eventName TEXT, startDate TEXT, endDate TEXT,eventDateString TEXT)",
).run();

const rows = db.prepare("SELECT eventName FROM events").all();
const existingTitles = new Set(rows.map((r) => r.title));

const insert = db.prepare(
  "INSERT INTO events (eventName, startDate, endDate, eventDateString) VALUES (?, ?, ?, ?)",
);

const insertMany = db.transaction((data) => {
  let count = 0;
  for (const element of data) {
    if (!existingTitles.has(element.eventName)) {
      insert.run(
        element.eventName,
        element.startDate,
        element.endDate,
        element.eventDateString,
      );
      existingTitles.add(element.eventName);
      count++;
    }
  }
  console.log(`Inserted ${count} new events.`);
});
let eventsList = [];
scrapedData.forEach((element) => {
  const dateParts = element.date.split(" ");
  const startMonth = Months[dateParts[1]];
  console.log(startMonth);
  const eventStartDate = new Date(
    parseInt(dateParts[2]),
    parseInt(startMonth),
    parseInt(dateParts[0]),
  );
  console.error(eventStartDate);
  if (isNaN(eventStartDate.getTime())) {
    console.error(`Invalid start date for event: ${element.title}`);
  }
  console.log(element.title);
  console.log(element.date.includes("—"));
  if (element.date.includes("—")) {
    const endMonth = Months[dateParts[5]];
    const eventEndDate = new Date(
      parseInt(dateParts[6]),
      parseInt(endMonth),
      parseInt(dateParts[4]),
    );
    console.log("DATA:");
    console.log(eventStartDate);
    console.log(element.date);
    eventsList.push(
      new Event(
        element.title,
        eventStartDate.toISOString(),
        eventEndDate.toISOString(),
        element.date,
      ),
    );
  } else {
    console.log(element.date);
    eventsList.push(
      new Event(
        element.title,
        eventStartDate.toISOString(),
        eventStartDate.toISOString(),
        element.date,
      ),
    );
  }
});

try {
  insertMany(eventsList);
} catch (err) {
  console.error("Error inserting data: ", err);
}

db.close();

console.log("Done!");

process.exit(0);
