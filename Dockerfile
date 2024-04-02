FROM oven/bun:alpine as builder
WORKDIR /home/bun/app

COPY ./ /home/bun/app/

RUN bun install && \
    bun build src/index.ts --target=bun --outfile=./bin/app.js && \
    bun build bin/app.js --compile --outfile=./bin/app

FROM alpine:latest
LABEL authors="Cikaros"

WORKDIR /home/bun/app

COPY --from=builder /home/bun/app/bin/app .

CMD ["./app"]