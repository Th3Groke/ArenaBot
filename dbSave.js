import Database from "better-sqlite3";
import { scrapedData } from "./scrape.js";

const db = new Database("events.sqlite");
db.prepare(
  "CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, date TEXT)",
).run();

const rows = db.prepare("SELECT title FROM events").all();
const existingTitles = new Set(rows.map((r) => r.title));

const insert = db.prepare("INSERT INTO events (title, date) VALUES (?, ?)");

const insertMany = db.transaction((data) => {
  let count = 0;
  for (const element of data) {
    if (!existingTitles.has(element.title)) {
      insert.run(element.title, element.date);
      existingTitles.add(element.title);
      count++;
    }
  }
  console.log(`Inserted ${count} new events.`);
});

try {
  insertMany(scrapedData);
} catch (err) {
  console.error("Error inserting data: ", err);
}

db.close();

console.log("Done!");

process.exit(0);
