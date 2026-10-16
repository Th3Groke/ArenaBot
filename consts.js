//Months class to help events date comparing
export const Months = {
  styczeń: 0,
  luty: 1,
  marzec: 2,
  kwiecień: 3,
  maj: 4,
  czerwiec: 5,
  lipiec: 6,
  sierpień: 7,
  wrzesień: 8,
  październik: 9,
  listopad: 10,
  grudzień: 11,
};

export const MonthNum = [
  "styczeń",
  "luty",
  "marzec",
  "kwiecień",
  "maj",
  "czerwiec",
  "lipiec",
  "sierpień",
  "wrzesień",
  "październik",
  "listopad",
  "grudzień",
];

export class Event {
  constructor(eventName, startDate, endDate, eventDateString) {
    this.eventName = eventName;
    this.startDate = startDate;
    this.endDate = endDate;
    this.eventDateString = eventDateString;
  }
}
export const db_path = "./data/events.sqlite"

export const maintenanceTime = "0 3 * * *";
