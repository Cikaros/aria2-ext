# 第一个阶段：编译 Go 程序
FROM golang:alpine AS builder
WORKDIR $GOPATH/src/aria2-ext
ENV ALL_PROXY="http://192.168.31.100:7890"
ENV HTTP_PROXY="http://192.168.31.100:7890"
ENV HTTPS_PROXY="http://192.168.31.100:7890"
# 设置交叉编译环境
RUN apk add build-base
ENV CGO_ENABLED=1
ENV GOOS=linux
ENV GOARCH=amd64
ENV GO111MODULE=on
ENV GOPROXY="https://goproxy.io"
# 将代码加入到镜像中
ADD . ./
# 编译程序
RUN go build -o aria2-ext .
RUN go build -o plugin-rss.so -buildmode=plugin ./plugin/default/RssPlugin.go

# 第二个阶段：运行程序
FROM alpine:latest
ENV ARIA2_PROTOCOL=http \
    ARIA2_HOST=127.0.0.1 \
    ARIA2_SECRET=P3TERX \
    ARIA2_PORT=6800 \
    ARIA2_PATH=/downloads \
    ARIA2_PLUGINS=/plugins/ \
    ARIA2_SKIP_BANNER=false \
    ARIA2_STARTUP=false \
    ARIA2_DB=/config/data.db

# 创建数据库文件，防止运行报错
RUN mkdir /config
# 拷贝编译好的二进制文件
COPY --from=builder /go/src/aria2-ext/aria2-ext /usr/local/bin/aria2-ext
COPY --from=builder /go/src/aria2-ext/plugin-*.so /default-plugins/


CMD ["/usr/local/bin/aria2-ext"]