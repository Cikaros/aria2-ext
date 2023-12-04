# 基础镜像
FROM rust:latest as builder
# 设置工作目录
WORKDIR /app
# 拷贝项目文件
COPY . .


# 构建应用程序
RUN cargo install diesel_cli --no-default-features --features sqlite && \
  cargo build --release

# 创建最终镜像
FROM debian:stable-slim
# 设置工作目录
WORKDIR /app

# 从构建阶段复制二进制文件
COPY --from=builder /app/target/release/aria2-ext /app/aria2-ext
COPY --from=builder /app/target/release/libdefault_plugin.so /app/plugins/libdefault_plugin.so
COPY --from=builder /app/aria2-ext.db /app/config/aria2-ext.db

RUN chmod +x /app/aria2-ext && \
  #sed -i 's/deb.debian.org/mirrors.ustc.edu.cn/g' /etc/apt/ sources.list && \
  apt-get update && apt-get install -y libsqlite3-dev ca-certificates && rm -rf /var/lib/apt/lists/*

ENV RUST_LOG=info
ENV ARIA2_DB=/app/config/aria2-ext.db
ENV ARIA2_PLUGIN_PATH=/app/plugins

# 运行应用程序
ENTRYPOINT ["./aria2-ext"]