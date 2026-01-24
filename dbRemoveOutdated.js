import Database from "better-sqlite3";

const db = new Database("events.sqlite");

const rows = db.prepare("SELECT * FROM events").all();

const Months = {
  stycznia: 0,
  lutego: 1,
  marca: 2,
  kwietnia: 3,
  maja: 4,
  czerwca: 5,
  lipca: 6,
  sierpnia: 7,
  września: 8,
  października: 9,
  listopada: 10,
  grudnia: 11,
};
const today = new Date();
today.setHours(0, 0, 0, 0);
let count = 0;

const deleteItem = db.prepare("DELETE FROM events WHERE id = ?");
rows.forEach((row) => {
  const id = row.id;
  const dateParts = row.date.split(" ");
  const day = parseInt(dateParts[0]);
  const monthName = dateParts[1];
  const year = parseInt(dateParts[2]);

  const eventDate = new Date(year, Months[monthName], day);

  if (eventDate < today) {
    deleteItem.run(row.id);
    count++;
  }
});
console.log(`removed records: ${count}`);
