import * as sdk from "matrix-js-sdk";
import {EventType, MsgType, ReceiptType, RoomEvent} from "matrix-js-sdk";
import C from "../config";

export type EventHandler = {
    obj: any,
    regex: RegExp,
    type: MsgType,
    handler: (event: sdk.MatrixEvent, room: sdk.Room, self: EventHandler) => void
}

class Bot {

    private client: sdk.MatrixClient;
    private roomId: string;
    private readonly commands: EventHandler[];

    constructor() {
        this.client = sdk.createClient({
            baseUrl: C.BASE_URL,
            deviceId: C.DEVICE_ID
        });
        this.roomId = '';
        this.commands = [];
        this.addCommend({
            obj: this,
            regex: /^.*/,
            type: MsgType.Text,
            handler: this._default_event_handler
        });
    }

    /**
     * 首次初始化Bot
     * <p>
     * 步骤如下：
     * <ul>
     * <li>生成新的Matrix Client,并根据配置进行账号登录
     * <li>设置Bot基本信息
     * <li>检查管理员是否与Bot在同一个房间，若不存在则创建房间并邀请管理员加入房间
     * <li>发送Bot启动消息，并初始话监听事件
     */
    async start() {
        await this.client.loginWithPassword(C.USER_ID, C.PASSWORD);
        await this.client.startClient();
        await this.client.setDisplayName(C.DISPLAY_NAME)
        let response = await this.client.getJoinedRooms();

        if (response.joined_rooms.length === 0) {
            await this.client.createRoom({
                name: C.ROOM_NAME
            });
            response = await this.client.getJoinedRooms();
        }

        const joinedRoomMembers = await this.client.getJoinedRoomMembers(response.joined_rooms[0]);

        const adminMember = joinedRoomMembers.joined[C.ADMIN_ID];
        if (adminMember === undefined) {
            await this.client.invite(response.joined_rooms[0], C.ADMIN_ID, C.INVITE_REASON);
        }
        this.roomId = response.joined_rooms[0];
        await this.sendTextNotice(C.ONLINE_NOTICE);
        this.client.addListener(RoomEvent.Timeline, async (event, room, toStartOfTimeline, removed, data) => await this._event(this, event, room, toStartOfTimeline));
    }

    addCommend(handler: EventHandler) {
        this.commands.unshift(handler);
    }

    async _event(self: Bot, event: sdk.MatrixEvent, room: sdk.Room | undefined, toStartOfTimeline: boolean | undefined) {
        const sender = event.getSender();
        if (sender === C.USER_ID) {
            return;
        }
        if (toStartOfTimeline) {
            return; // don't print paginated results
        }
        if (event.getType() !== EventType.RoomMessage) {
            return; // only print messages
        }
        if (room !== undefined) {
            const command = self.findCommand(event);
            if (command !== undefined) {
                command.handler(event, room, command);
            }
            await this.client.sendReadReceipt(event, ReceiptType.FullyRead);
        }
    }

    async _default_event_handler(event: sdk.MatrixEvent, room: sdk.Room, self: EventHandler) {
        const sender = event.getSender();
        const content = event.getContent();
        await bot.sendTextMessage("收到消息啦！:: " + content['body']);
        console.info("(%s) %s :: %s", room.name, sender, content.body);
    }

    /**
     * 发送文本通知
     * @param msg
     */
    async sendTextNotice(msg: string) {
        return await this.client.sendNotice(this.roomId, msg);
    }

    /**
     * 发送Html通知
     * @param body
     * @param html
     */
    async sendHtmlNotice(body: string, html: string) {
        return await this.client.sendHtmlNotice(this.roomId, body, html);
    }

    /**
     * 发送文本信息
     * @param msg
     */
    async sendTextMessage(msg: string) {
        return await this.client.sendTextMessage(this.roomId, msg);
    }

    /**
     * 发送Html信息
     * @param body
     * @param html
     */
    async sendHtmlMessage(body: string, html: string) {
        return await this.client.sendHtmlMessage(this.roomId, body, html);
    }

    /**
     * 程序结束时终止Bot
     */
    async stop() {
        await this.sendTextNotice(C.OFFLINE_NOTICE);
        await this.client.logout(true);
    }

    findCommand(event: sdk.MatrixEvent): EventHandler | undefined {
        const sender = event.getSender();
        const content = event.getContent();
        for (let command of this.commands) {
            if (command.type === content.msgtype && command.regex.test(content.body)) {
                return command;
            }
        }
        return undefined;
    }
}

const bot = new Bot();

await bot.start();

export default bot;