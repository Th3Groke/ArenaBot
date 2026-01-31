# ArenaBot 🏟️

**ArenaBot** is a Discord utility designed for Silesian University of Technology students to monitor parking availability near the **PreZero Arena Gliwice**. It automatically scrapes event data, maintains a local schedule, and updates Discord channel names to indicate if parking is open or closed due to events.

---

## 🚀 Features

* **Web Scraping**: Uses `Puppeteer` to automatically fetch the latest event schedule from the Arena Gliwice website.
* **Dynamic Channel Management**: Automatically renames a designated parking channel to `Parking: 🛑 Closed today` or `Parking: 🟢 Open today`.
* **Automated Maintenance**: A cron job runs every night at 03:00 AM to scrape new events and remove outdated records from the database.
* **Comprehensive Command Suite**: Users can check the current arena status, list upcoming events, or receive a full schedule via DM.
* **Intelligent Parsing**: Custom logic to handle Polish date formats and multi-day event ranges.

## 🛠️ Technical Stack

* **Runtime**: Node.js
* **Discord API**: `discord.js` (v14+)
* **Scraping**: `Puppeteer` & `Cheerio`
* **Database**: `better-sqlite3`
* **Scheduling**: `node-cron`
* **Environment**: `dotenv`

## 📋 Prerequisites

* **Node.js**: v18.0.0 or higher (required for top-level await in scraping).
* **Discord Bot Token**: From the [Discord Developer Portal](https://discord.com/developers/applications).
* **Channel ID**: The ID of the channel the bot will rename.

## ⚙️ Installation & Setup

1.  **Clone the Repository**:
    ```bash
    git clone [https://github.com/Th3Groke/ArenaBot.git](https://github.com/Th3Groke/ArenaBot.git)
    cd ArenaBot
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env` file in the root directory:
    ```env
    DISCORD_TOKEN=your_bot_token_here
    PARKING_CHANNEL_ID=your_channel_id_here
    ```

4.  **Initialize Database**:
    The bot will automatically create the `events.sqlite` file and the necessary table on its first run or via the `dbSave.js` script.

## 🤖 Commands

| Command | Description |
| :--- | :--- |
| `!arena` | Checks if parking is open for the current day. |
| `!events` | Prints a list of the 10 most recent upcoming events. |
| `!eventsall` | Sends a Direct Message to the user with the full list of scheduled events. |
| `!help` | Displays the help message with all available commands. |
| `!clear [n]` | Deletes the specified number of messages (Admin only). |

## 🖥️ System Architecture

The bot operates through several specialized modules:
* **`bot.js`**: The main entry point. Handles Discord interactions and the `node-cron` maintenance schedule.
* **`scrape.js`**: Headless browser logic to pull event titles and dates from the web.
* **`dbSave.js`**: Processes scraped data, converts Polish dates to ISO strings, and saves new events.
* **`dbRemoveOutdated.js`**: Cleans the database by removing events that have already ended.

## ⚖️ License

This project is licensed under the **MIT License**.

> **The MIT License (MIT)**
>
> Copyright (c) 2026 Th3Groke
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

---
*Developed by [Th3Groke](https://github.com/Th3Groke)*
