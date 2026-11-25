# Multi-stage build for the Glific staff console (static SPA served by nginx).
#
# Vite inlines import.meta.env.VITE_* at BUILD time. The staff app derives the backend
# origin from VITE_GLIFIC_BACKEND_URL, which src/config/index.ts treats as a BARE HOSTNAME
# (it prepends window.location.protocol and appends /api and /socket). So pass just the
# backend host here, with no scheme, no port, no path.
ARG NODE_VERSION=22.23.1

FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app

# Bare backend hostname, e.g. backend-abc123.bunnyenv.com (NOT a full URL).
ARG VITE_GLIFIC_BACKEND_URL
# Leave prefix/port empty: when VITE_GLIFIC_BACKEND_URL is set, config/index.ts uses the
# host verbatim over https:443, so an "api." prefix or :4001 port would break the URL.
ARG VITE_API_PREFIX=""
ARG VITE_GLIFIC_API_PORT=""
ARG VITE_APPLICATION_NAME="Glific: Two way communication platform"
ENV VITE_GLIFIC_BACKEND_URL=$VITE_GLIFIC_BACKEND_URL \
    VITE_API_PREFIX=$VITE_API_PREFIX \
    VITE_GLIFIC_API_PORT=$VITE_GLIFIC_API_PORT \
    VITE_APPLICATION_NAME=$VITE_APPLICATION_NAME

RUN corepack enable
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
# `yarn build` runs `yarn setup` (which reinstalls) then vite build; call the steps
# directly so the cached install above is reused. floweditor copies the flow-editor
# static bundle into public/ before the build. Output goes to build/ (vite.config outDir).
RUN yarn floweditor && yarn vite build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
