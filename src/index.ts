import process from "node:process";
import bot from "./lib/bot";
import db from "./lib/db";
import rss from "./lib/rss";
import downloader from "./lib/downloader";
import {MsgType} from "matrix-js-sdk";

bot.addCommend({
    obj: this,
    regex: /^reboot$/,
    type: MsgType.Text,
    handler: ()=> process.kill(process.pid, 'SIGTERM')
});

process.on("SIGTERM", async () => {
    rss.stop();
    await downloader.stop();
    db.close();
    await bot.stop();
    process.exit(0);
});
