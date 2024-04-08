import Parser from "rss-parser";
import C from "../config";
import bot, {type EventHandler} from "./bot";
import db from "./db";
import type {AddSubscription, Subscription} from "./entry";
import downloader from "./downloader.ts";
import {MsgType} from "matrix-js-sdk";
import * as sdk from "matrix-js-sdk";

type Torrent = {
    link: string,
    contentLength: number,
    pubDate: string,
}

type CustomItem = {
    guid: string,
    link: string,
    title: string,
    description: string,
    torrent: Torrent,
    enclosure: Parser.Enclosure
};

class Rss {
    private readonly intervalID: Timer;
    private parser: Parser<Parser.Output<CustomItem>, CustomItem>;

    constructor() {
        this.intervalID = setInterval(() => this.callback(), +C.INTERVAL_TIMEOUT);
        this.parser = new Parser({
            timeout: +C.RSS_TIMEOUT,
            customFields: {
                item: ['guid', 'link', 'title', 'description', 'torrent', 'enclosure']
            }
        });
        bot.addCommend({
            obj: this,
            regex: /^add ((http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\\@?^=%&/~\+#])?)$/,
            type: MsgType.Text,
            handler: this._addSubscription
        });
        bot.addCommend({
            obj: this,
            regex: /^list$/,
            type: MsgType.Text,
            handler: this._showSubscription
        });
        bot.addCommend({
            obj: this,
            regex: /^update (\d+)$/,
            type: MsgType.Text,
            handler: this._updateSubscription
        });
    }

    async callback() {
        //数据库查询
        const subscriptions: Subscription[] = db.getSubscriptions();
        for (let subscription of subscriptions) {
            try {
                await this.process(subscription);
            } catch (e) {
                await bot.sendTextMessage(`订阅[${subscription.title}]获取失败！`);
            }
        }
    }

    private async process(subscription: Subscription) {
        const channel = await this.parser.parseURL(subscription.link);
        //确定数据库中是否存在这些数据
        const files = db.getFiles(subscription);
        const guids = files.map(item => item.guid);
        //过滤出不存在的数据
        const addFiles = channel.items.filter(item => guids.indexOf(item.guid) === -1)
            .map(item => {
                return {
                    reference: subscription.id,
                    guid: item.guid + '',
                    is_perma_link: true,
                    link: item.link + '',
                    title: item.title + '',
                    description: channel.description + '',
                    torrent_link: item.torrent.link + '',
                    torrent_content_length: +item.torrent.contentLength,
                    torrent_pub_date: item.torrent.pubDate + '',
                    enclosure_type: item.enclosure.type + '',
                    enclosure_length: +(item.enclosure.length + '0'),
                    enclosure_url: item.enclosure.url + '',
                    aria_id: ''
                };
            });
        for (let file of addFiles) {
            //通知downloader进行下载
            file.aria_id = await downloader.addUriAndDir(file.enclosure_url, subscription.path);
            //向Admin发送消息事件
            await bot.sendTextMessage(`已将[${file.title}]加入下载列表！`);
        }
        //插入数据库
        db.addFiles(addFiles);
    }

    async _addSubscription(event: sdk.MatrixEvent, room: sdk.Room, self: EventHandler) {
        const sender = event.getSender();
        const content = event.getContent();
        const params = self.regex.exec(content['body']);
        if (params !== null) {
            const url = params[1];
            await self.obj.addSubscription(url);
        }
    }

    async _showSubscription(event: sdk.MatrixEvent, room: sdk.Room, self: EventHandler) {
        const sender = event.getSender();
        const content = event.getContent();
        const subscriptions = db.getSubscriptions();
        let body = '<table border="1">';
        body += `<thead><tr><th>ID</th><th>标题</th><th>订阅地址</th></tr></thead><tbody>`;
        for (let subscription of subscriptions) {
            body += `<tr><td>${subscription.id}</td><td>${subscription.title}</td><td>${subscription.link}</td></tr>`
        }
        body += '</tbody></table>';
        await bot.sendHtmlMessage("订阅信息：", body);
    }

    async _updateSubscription(event: sdk.MatrixEvent, room: sdk.Room, self: EventHandler) {
        const sender = event.getSender();
        const content = event.getContent();
        const params = self.regex.exec(content['body']);
        if (params !== null) {
            const id = parseInt(params[1]);
            await self.obj.updateSubscription(id);
        }
    }

    async addSubscription(url: string) {
        //获取订阅信息,
        const channel = await this.parser.parseURL(url);
        //检查数据库中是否已存在该订阅
        if (db.existsSubscription(channel.link + '')) {
            await bot.sendTextMessage(`该订阅地址[${url}]已存在！`);
            return;
        }
        //获取配置
        const globalOption = await downloader.getGlobalOption();
        //构造订阅对象
        const subscription: AddSubscription = {
            title: channel.title + '',
            description: channel.description + '',
            link: channel.link + '',
            path: `${globalOption.dir}/${channel.title}`,
        }
        //插入数据库
        db.addSubscriptions([subscription]);
    }

    async updateSubscription(id: number) {
        let findSubscription = db.getSubscriptions();
        if (id !== -1) {
            findSubscription = findSubscription.filter(item => item.id === id);
        }
        for (let subscription of findSubscription) {
            try {
                await this.process(subscription);
            } catch (e) {
                await bot.sendTextMessage(`订阅[${subscription.title}]获取失败！`);
            }
        }
    }

    stop() {
        clearInterval(this.intervalID);
    }
}

export default new Rss();