import config from "../config.ts";
import * as http from "http";

// SSE服务器的URL
const sseUrl = config.SSE_URL;

// 发起HTTP请求
const req = http.request(sseUrl, (res) => {
    // 检查状态码
    if (res.statusCode !== 200) {
        console.info('SSE请求失败:', res.statusCode);
        return;
    }

    // 设置响应数据编码为UTF-8
    res.setEncoding('utf8');

    // 创建EventSource对象
    const eventSource = new EventSource(sseUrl);

    // 监听SSE事件
    eventSource.onmessage = (event) => {
        console.info('收到SSE消息:', event.data);
    };

    eventSource.onerror = (error) => {
        console.info('SSE错误:', error);
    };
});

req.on('error', (error) => {
    console.info('SSE请求错误:', error);
});

req.end();
export default req;