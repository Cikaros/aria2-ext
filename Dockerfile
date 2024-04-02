FROM oven/bun:alpine as builder
WORKDIR /home/bun/app

COPY ./ /home/bun/app/

RUN bun install && \
    bun build src/index.ts --target=node --outfile=./bin/app.js

FROM node:lts-alpine
LABEL authors="Cikaros"

WORKDIR /home/bun/app

COPY --from=builder /home/bun/app/bin/app.js .

ENTRYPOINT ["node"]

CMD ["app.js"]