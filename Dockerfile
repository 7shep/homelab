FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
# The server is executed with tsx and applies migrations with the Drizzle
# migrator at boot, so the runtime image needs the full dependency set (tsx is
# a dev dependency). For this self-hosted tool we favor a correct, simple image
# over shaving the dev deps.
RUN npm ci
COPY --from=build /app/dist ./dist
COPY server ./server
COPY shared ./shared
COPY drizzle.config.ts ./
EXPOSE 8787
# Bind to all interfaces inside the container; expose it deliberately via the
# compose port mapping / a reverse proxy rather than relying on the default.
ENV HOST=0.0.0.0
CMD ["sh", "-c", "npm run db:migrate && npx tsx server/index.ts"]
