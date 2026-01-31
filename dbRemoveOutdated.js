import Database from "better-sqlite3";
import { Months } from "./consts.js";

const db = new Database("events.sqlite");

const rows = db.prepare("SELECT * FROM events").all();

const today = new Date();
today.setHours(0, 0, 0, 0);
let count = 0;

const deleteItem = db.prepare("DELETE FROM events WHERE id = ?");
rows.forEach((row) => {
  if (rows.endDate < today) {
    deleteItem.run(row.id);
    count++;
  }
});
console.log(`removed records: ${count}`);
