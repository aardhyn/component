FROM emscripten/emsdk:latest AS core
WORKDIR /app
COPY core .
COPY .env .
RUN make build

FROM node:current-alpine AS editor
WORKDIR /app
RUN corepack enable
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
COPY editor .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN mkdir src/modules public/assets
COPY --from=core /app/out/core.mjs src/modules
COPY --from=core /app/out/core.wasm public/assets
RUN pnpm build

FROM caddy:latest AS production
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=editor /app/dist /srv
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]