import { Client, GatewayIntentBits, MessageFlags } from "discord.js";
import Database from "better-sqlite3";
import cron from "node-cron";
import { maintenanceTime } from "./consts.js";
import { exec } from "child_process";
import "dotenv/config";
import fs from "fs/promises";
import { start } from "repl";

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
      if (stderr) console.error(`⚠️ dbRemoveOutdated stderr: ${stderr}`);
      console.log(`✅ dbRemoveOutdated Output:\n${stdout}`);
    });
    changeDailyStatus();
  });
});

//Changing daily status handle
async function changeDailyStatus() {
  const channel = client.channels.cache.get(process.env.PARKING_CHANNEL_ID);
  if (!channel) {
    console.error("❌ Could not find the parking channel.");
    return;
  }

  const rows = db
    .prepare(
      "SELECT eventName, startDate, endDate FROM events ORDER BY startDate LIMIT 10",
    )
    .all();

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  const todayTime = today.getTime();

  let eventToday = false;

  for (const row of rows) {
    const start = new Date(row.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(row.endDate);
    end.setHours(0, 0, 0, 0);

    const startTime = start.getTime();
    const endTime = end.getTime();

    if (todayTime >= startTime && todayTime <= endTime) {
      eventToday = true;
      break;
    }
  }

  const newName = eventToday
    ? "Parking: 🛑 Closed today"
    : "Parking: 🟢 Open today";

  if (channel.name !== newName) {
    try {
      await channel.setName(newName);
      console.log(`✅ Channel name updated to: ${newName}`);
    } catch (err) {
      console.error("❌ Failed to rename the channel:", err.message);
    }
  } else {
    console.log(`ℹ️ Channel name is already correct: ${newName}`);
  }
}

//!clear handling
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  let regeTest = new RegExp("!clear [1-9]\d*");
  if (regeTest.test(message.content)) {
    if (message.author.id == 1023198285369983016) {
      message.channel.send("nope :middle_finger:");
      return;
    }
    const number = parseInt(message.content.split(" ")[1]);
    try {
      await message.channel.bulkDelete(number + 1);
    } catch (err) {
      message.channel.send(err.message);
      return;
    }
    message.channel.send(`removed ${number} messages. :+1:`);
    setTimeout(() => {
      message.channel.bulkDelete(1);
    }, 2000);
  }
});

//!help handling
async function readHelpFile() {
  try {
    const data = await fs.readFile("helpMessage.txt", "utf8");
    return data;
  } catch (err) {
    console.error("Error reading file:", err);
    return "Could not load help message.";
  }
}
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!help") {
    const helpMessage = await readHelpFile();
    message.reply(helpMessage);
    return;
  }
});

//Handling !events message
client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content === "!events") {
    const rows = db
      .prepare(
        "SELECT eventName, eventDateString AS date FROM events ORDER BY startDate LIMIT 10",
      )
      .all();

    if (rows.length === 0) {
      message.reply("No events found in the database.");
      return;
    }

    const eventList = rows
      .map((row) => `• **${row.eventName}**\n   📅 ${row.date}`)
      .join("\n\n");

    message.reply(`Here are the upcoming event:\n\n${eventList}`);
  }
});

//Handling !arena message
client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content === "!arena") {
    const row = db
      .prepare(
        "SELECT eventName, startDate, endDate, eventDateString FROM events ORDER BY startDate LIMIT 1",
      )
      .get();

    if (!row) {
      message.reply("Parking is open today.✅ No upcomming events found");
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(row.startDate).setHours(0, 0, 0, 0);
    const endDate = new Date(row.endDate).setHours(0, 0, 0, 0);
    if (startDate == endDate) {
      if (startDate === today) {
        message.reply(
          `Parking today is closed 🛑. The event today is ${row.eventName}`,
        );
        return;
      }
      message.reply(
        `Parking is open today.✅ The nearest event: ${row.eventName} is on ${row.eventDateString}`,
      );
      return;
    } else {
      if (today >= startDate && today <= endDate) {
        message.reply(
          `Parking today is closed 🛑. The event today is ${row.eventName}`,
        );
        return;
      } else {
        message.reply(
          `Parking is open today. ✅ The nearest event: ${row.eventName} is on ${row.eventDateString}`,
        );
      }
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
