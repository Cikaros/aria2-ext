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
            regex: /^add (.*)$/,
            type: MsgType.Text,
            handler: this._addSubscription
        });
    }

    async callback() {
        //数据库查询
        const subscriptions: Subscription[] = db.getSubscriptions();
        for (let subscription of subscriptions) {
            const channel = await this.parser.parseURL(subscription.link);
            await this.process(subscription, channel);
        }
    }

    private async process(subscription: Subscription, channel: Parser.Output<CustomItem>) {
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
            await bot.sendTextNotice(`已将[${file.title}]加入下载列表！`);
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

    stop() {
        clearInterval(this.intervalID);
    }
}

export default new Rss();