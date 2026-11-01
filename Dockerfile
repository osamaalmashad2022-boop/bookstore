# syntax = docker/dockerfile:1

ARG NODE_VERSION=22-slim
FROM node:${NODE_VERSION} AS base

LABEL fly_launch_runtime="Node.js"

WORKDIR /app

ENV PORT="3000"


# ----------------------------------------------------
# 1. Build Stage
# ----------------------------------------------------
FROM base AS build

# Set development mode during build so devDependencies (typescript, vite, etc.) are installed
ENV NODE_ENV="development"

# Install system dependencies needed to compile native addons (better-sqlite3 / node-gyp)
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3 && \
    rm -rf /var/lib/apt/lists/*

# Copy package manifests for all workspaces
COPY package.json package-lock.json ./
COPY server/package.json server/package-lock.json* ./server/
COPY client/package.json client/package-lock.json* ./client/

# Install dependencies for root, server, and client
RUN npm install
RUN npm --prefix server install
RUN npm --prefix client install

# Copy application source code
COPY . .

# Build backend (tsc) and frontend (vite build)
RUN npm run build

# Seed database with initial catalog
RUN npm --prefix server run seed

# Prune development dependencies to keep final image clean
RUN npm prune --omit=dev
RUN npm --prefix server prune --omit=dev


# ----------------------------------------------------
# 2. Final Production Runtime Image
# ----------------------------------------------------
FROM base

ENV NODE_ENV="production"

# Copy built app and dependencies from build stage
COPY --from=build /app /app

# Ensure SQLite data directory exists
RUN mkdir -p /app/server/data

EXPOSE 3000

CMD [ "npm", "run", "start" ]

