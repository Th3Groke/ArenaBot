import Database from "better-sqlite3";

const db = new Database("events.sqlite");

const rows = db.prepare("SELECT * from events").all();
const data = new Map(rows.map((r) => [r.title, r.date]));
console.table(data);
