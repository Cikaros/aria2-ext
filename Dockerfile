# 基础镜像
FROM rust:latest as builder
# 设置工作目录
WORKDIR /app
# 拷贝项目文件
COPY . .
# 构建应用程序
RUN cargo install diesel_cli --no-default-features --features sqlite && \
  cargo build --release && \
  diesel migration run

# 创建最终镜像
FROM alpine:latest
# 设置工作目录
WORKDIR /app

# 从构建阶段复制二进制文件
COPY --from=builder /app/target/release/aria2-ext ./aria2-ext
COPY --from=builder /app/target/release/libdefault_plugin.so ./plugins/libdefault-plugins.so
COPY --from=builder /app/config/aria2-ext.db ./config/aria2-ext.db

# 运行应用程序
CMD ["./aria2-ext"]