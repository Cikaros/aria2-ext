import * as process from "node:process"
const config = {
    SSE_URL: process.env.SSE_URL || "http://127.0.0.1:8844/stream",
    DB_URI: process.env.DB_URI || "./aria2-ext.db",
    BASE_URL: process.env.BASE_URL || 'https://matrix.org',
    ROOM_NAME: process.env.ROOM_NAME || 'BOT消息通知',
    INVITE_REASON: process.env.INVITE_REASON || 'BOT邀请您加入房间，实时接收消息！',
    ONLINE_NOTICE: process.env.ONLINE_NOTICE || 'Hello, Bot已上线！',
    OFFLINE_NOTICE: process.env.OFFLINE_NOTICE || 'Hello, Bot即将下线！',
    DEVICE_ID: process.env.DEVICE_ID || 'HAINCIWNO1',
    DISPLAY_NAME: process.env.DISPLAY_NAME || 'Bot',
    ADMIN_ID: process.env.ADMIN_ID || '@cikaros:matrix.org',
    USER_ID: process.env.USER_ID || '@bot:matrix.org',
    PASSWORD: process.env.PASSWORD || '',
    INTERVAL_TIMEOUT: process.env.INTERVAL_TIMEOUT || 60 * 1000,
    RSS_TIMEOUT: process.env.RSS_TIMEOUT || 10 * 1000,
    ARIA2_HOST: process.env.ARIA2_HOST || 'localhost',
    ARIA2_PORT: process.env.ARIA2_PORT || 6800,
    ARIA2_SECURE: process.env.ARIA2_SECURE || false,
    ARIA2_SECRET: process.env.ARIA2_SECRET || '',
    ARIA2_PATH: process.env.ARIA2_PATH || '/jsonrpc',
}

export default config;