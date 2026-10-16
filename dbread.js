import Database from "better-sqlite3";
import db_path from "consts.js";
const db = new Database("events.sqlite");

const rows = db.prepare("SELECT * FROM events").all();
const data = new Map(
  rows.map((r) => [
    r.id,
    {
      eventName: r.eventName,
      startDate: r.startDate,
      endDate: r.endDate,
      stringDate: r.eventDateString,
    },
  ]),
);

console.table(Object.fromEntries(data));
