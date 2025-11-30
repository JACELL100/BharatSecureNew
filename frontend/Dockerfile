# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.14.0

################################################################################
# Base image
FROM node:${NODE_VERSION}-alpine as base
WORKDIR /usr/src/app

################################################################################
# Install production dependencies
FROM base as deps

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

################################################################################
# Build stage
FROM base as build

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .
RUN npm run build

################################################################################
# Final runtime image
FROM base as final

ENV NODE_ENV=production

# Run as non-root
USER node

# Copy package.json (mostly for metadata / scripts if needed)
COPY --chown=node:node package.json .

# Copy production dependencies with correct ownership
COPY --from=deps --chown=node:node /usr/src/app/node_modules ./node_modules

# Copy the built app and any other needed files with correct ownership
COPY --from=build --chown=node:node /usr/src/app/. ./

EXPOSE 5173

CMD ["npm", "start"]
