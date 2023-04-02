# 第一个阶段：编译 Go 程序
FROM golang:alpine AS builder
WORKDIR $GOPATH/src/aria2-ext
# 将代码加入到镜像中
ADD . ./
# 设置交叉编译环境
RUN apk add build-base
ENV CGO_ENABLED=1
ENV GOOS=linux
ENV GOARCH=amd64
ENV GO111MODULE=on
ENV GOPROXY="https://goproxy.io"
# 编译程序
RUN go build -o aria2-ext . && \
    go build -o plugin-rss.so -buildmode=plugin ./plug-in/RssPlugin.go

# 第二个阶段：运行程序
FROM alpine:latest
ENV ARIA2_PROTOCOL=http \
    ARIA2_HOST=127.0.0.1 \
    ARIA2_SECRET=P3TERX \
    ARIA2_PORT=6800 \
    ARIA2_PATH=/downloads \
    ARIA2_PLUGINS=/plugins/ \
    ARIA2_DB=/config/data.db
# 拷贝编译好的二进制文件
COPY --from=builder /go/src/aria2-ext/aria2-ext /usr/local/bin/aria2-ext
COPY --from=builder /go/src/aria2-ext/plugin-*.so $ARIA2_PLUGINS
CMD ["/usr/local/bin/aria2-ext"]