FROM oven/bun:debian as builder
WORKDIR /home/bun/app

COPY ./ /home/bun/app/

RUN bun build src/index.ts --target=bun --outfile=./bin/app.js

FROM oven/bun:debian
LABEL authors="Cikaros"

WORKDIR /home/bun/app


COPY --from=builder /home/bun/app/bin/app.js .

ENTRYPOINT ["bun"]

CMD ["run","app.js"]