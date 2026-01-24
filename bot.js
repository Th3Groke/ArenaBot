import { Client, GatewayIntentBits, MessageFlags } from "discord.js";
import Database from "better-sqlite3";
import cron from "node-cron";
import { Months, maintenanceTime } from "./consts.js";
import { exec } from "child_process";
import "dotenv/config";

const db = new Database("events.sqlite", { readonly: true });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

//Bot setup

client.once("ready", () => {
  console.log(`Bot is online! Logged in as ${client.user.tag}`);

  //FOR TESTING
  changeDailyStatus();
  //

  cron.schedule(maintenanceTime, () => {
    console.log("🕒 Starting daily database maintenance...");
    changeDailyStatus();

    exec("node dbSave.js", (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error running dbSave: ${error.message}`);
        return;
      }
      if (stderr) console.error(`⚠️ dbSave Stderr: ${stderr}`);
      console.log(`✅ dbSave Output:\n${stdout}`);
    });
    exec("node dbRemoveOutdated.js", (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error running dbRemoveOutdated: ${error.message}`);
        return;
      }
      console.log(`✅ dbRemoveOutdated Output:\n${stdout}`);
    });
  });
});

//Changing daily status handle
async function changeDailyStatus() {
  const channel = client.channels.cache.get(process.env.PARKING_CHANNEL_ID);
  if (!channel) {
    console.error("❌Could not find the parking channel. Check ID in .env");
    return;
  }
  const rows = db.prepare("SELECT title, date FROM events").all();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let eventToday = false;

  rows.forEach((row) => {
    const parts = row.date.split(" ");
    const day = parseInt(parts[0]);
    const month = parts[1];
    const year = parseInt(parts[2]);
    if (parts.size > 3) {
      const endDay = parseInt(parts[4]);
      const endMonth = parts[5];
      const endYear = parseInt(parts[6]);
      const eventStartDate = new Date(year, Months[month], day);
      const eventEndDate = new Date(endYear.Months[endMonth], endDay);

      if (
        eventStartDate.toString() <= today.toString() &&
        eventEndDate.toString >= today.toString
      ) {
        eventToday = true;
        return;
      }
    }
    const eventDate = new Date(year, Months[month], day);
    if (eventDate.toString() === today.toString()) {
      eventToday = true;
      return;
    }
  });
  const newName = eventToday
    ? "Parking: 🛑 Closed today"
    : "Parking: 🟢 Open today";
  if (channel.name != newName) {
    try {
      await channel.setName(newName);
      console.log("✅channel name updated");
    } catch (err) {
      console.error("❌failed to rename the channel");
      console.error(err);
    }
  }
}

//Handling !events message
client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content === "!events") {
    const rows = db.prepare("SELECT title, date FROM events LIMIT 10").all();

    console.log(rows.length);
    if (rows.length === 0) {
      message.reply("No events found in the database.");
      return;
    }

    const eventList = rows
      .map((row) => `• **${row.title}**\n   📅 ${row.date}`)
      .join("\n\n");

    message.reply(`Here are the upcoming event:\n\n${eventList}`);
  }
});

//Handling !arena message
client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content === "!arena") {
    const row = db.prepare("SELECT title, date FROM events LIMIT 1").get();

    if (!row) {
      message.reply("Parking is open today.✅ No upcomming events found");
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDateParts = row.date.split(" ");
    if (!row.date.includes("-")) {
      const day = parseInt(eventDateParts[0]);
      const monthName = eventDateParts[1];
      const year = parseInt(eventDateParts[2]);
      const eventDate = new Date(year, Months[monthName], day);

      console.log(eventDate.toString());
      if (eventDate.toString() === today.toString()) {
        message.reply(
          `Parking today is closed 🛑. The event today is ${row.title}`,
        );
        return;
      }
      message.reply(
        `Parking is open today.✅ The nearest event: ${row.title} is on ${row.date}`,
      );
      return;
    }

    if (row.date.includes("-")) {
      const startDay = parseInt(eventDateParts[0]);
      const startMonth = eventDateParts[1];
      const startYear = parseInt(eventDateParts[2]);
      const endDay = parseInt(eventDateParts[4]);
      const endMonth = eventDateParts[5];
      const endYear = parseInt(eventDateParts[6]);

      const eventStartDate = new Date(startYear, Months[startMonth], startDay);
      const eventEndDate = new Date(endYear, Months[endMonth], endDay);

      if (
        today.toString() >= eventStartDate.toString() &&
        today.toString() <= eventEndDate.toString()
      ) {
        message.reply(
          `Parking today is closed 🛑. The event today is ${row.title}`,
        );
        return;
      } else {
        message.reply(
          `Parking is open today. ✅ The nearest event: ${row.title} is on ${row.date}`,
        );
      }
    }
  }
});

client.login(process.env.DiSCORD_TOKEN);
