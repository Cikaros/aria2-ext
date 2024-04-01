import {WebSocket as Aria2} from "libaria2";
import {Adapter} from "libaria2";
import bot from "./bot";
import C from "../config";

class Downloader {

    private readonly aria2: Aria2.Client;

    constructor() {
        this.aria2 = new Aria2.Client({
            port: +C.ARIA2_PORT,
            host: C.ARIA2_HOST,
            path: C.ARIA2_PATH,
            auth: {
                secret: C.ARIA2_SECRET
            }
        });
        this.aria2.once('ws.open', this.onStart)
            .once('ws.close', this.onClose)
            // .once('ws.message', this.onMessage)
            .once('aria2.onDownloadStart', this.onDownloadStart)
            .once('aria2.onDownloadPause', this.onDownloadPause)
            .once('aria2.onDownloadStop', this.onDownloadStop)
            .once('aria2.onDownloadComplete', this.onDownloadComplete)
            .once('aria2.onDownloadError', this.onDownloadError)
            .once('aria2.onBtDownloadComplete', this.onBtDownloadComplete);
    }

    async onDownloadStart(e: Adapter.IAria2NotificationEvent) {
        const option = await this.tellStatus(e.gid);
        await bot.sendTextMessage(`资源[${e.gid}]开始下载！\n文件位置：${option.files[0].path}`);
    }

    async onDownloadPause(e: Adapter.IAria2NotificationEvent) {
        const option = await this.tellStatus(e.gid);
        await bot.sendTextMessage(`资源[${e.gid}]暂停下载！\n文件位置：${option.files[0].path}`);
    }

    async onDownloadStop(e: Adapter.IAria2NotificationEvent) {
        const option = await this.tellStatus(e.gid);
        await bot.sendTextMessage(`资源[${e.gid}]停止下载！\n文件位置：${option.files[0].path}`);
    }

    async onDownloadComplete(e: Adapter.IAria2NotificationEvent) {
        const option = await this.tellStatus(e.gid);
        await bot.sendTextMessage(`资源[${e.gid}]下载完成！\n文件位置：${option.files[0].path}`);
    }

    async onDownloadError(e: Adapter.IAria2NotificationEvent) {
        const option = await this.tellStatus(e.gid);
        await bot.sendTextMessage(`资源[${e.gid}]下载失败！\n文件位置：${option.files[0].path}`);
    }

    async onBtDownloadComplete(e: Adapter.IAria2NotificationEvent) {
        const option = await this.tellStatus(e.gid);
        await bot.sendTextMessage(`BT资源[${e.gid}]下载完成！文件位置：${option.files[0].path}`);
    }

    async onStart() {
        const version = await this.getVersion();
        await bot.sendTextNotice(`Aria2 is Open! The Version is ${version.version}`);
    }

    async onClose() {
        await bot.sendTextNotice("Aria2 is Close!");
    }

    async onMessage(params: any) {
        await bot.sendTextNotice(`${params}`);
    }

    async stop() {
        await this.aria2.close();
    }

    async getVersion() {
        return await this.aria2.getVersion();
    }

    async addUri(uris: string, dir: string) {
        return await this.aria2.addUri(uris, {dir: dir});
    }

    async remove(gid: string) {
        return await this.aria2.remove(gid);
    }

    async pause(gid: string) {
        return await this.aria2.pause(gid);
    }

    async pauseAll() {
        return await this.aria2.pauseAll();
    }

    async unpause(gid: string) {
        return await this.aria2.unpause(gid);
    }

    async unpauseAll() {
        return await this.aria2.unpauseAll();
    }

    async getGlobalOption() {
        return await this.aria2.getGlobalOption();
    }

    async getOption(gid: string) {
        return await this.aria2.getOption(gid);
    }

    async tellStatus(gid: string) {
        return await this.aria2.tellStatus(gid);
    }
}

const downloader = new Downloader();

export default downloader;