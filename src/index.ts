import process from "node:process";
import bot from "./lib/bot";
import db from "./lib/db";
import rss from "./lib/rss";
import downloader from "./lib/downloader";

process.on("SIGTERM", async () => {
    rss.stop();
    await downloader.stop();
    db.close();
    await bot.stop();
    process.exit(0);
});
