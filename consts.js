//Months class to help events date comparing\
export const Months = {
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

export const MonthNum = [
  "stycznia",
  "lutego",
  "marca",
  "kwietnia",
  "maja",
  "czerwca",
  "lipca",
  "sierpnia",
  "września",
  "października",
  "listopada",
  "grudnia",
];

export class Event {
  constructor(eventName, startDate, endDate, eventDateString) {
    this.eventName = eventName;
    this.startDate = startDate;
    this.endDate = endDate;
    this.eventDateString = eventDateString;
  }
}

export const maintenanceTime = "0 3 * * *";
