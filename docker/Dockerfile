FROM node:18-alpine AS base

# Create app directory
WORKDIR /app/glific-frontend

# Install dependencies
RUN apk add --no-cache --update \
    build-base git curl vim zsh inotify-tools openssl ncurses-libs 
 
# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./
COPY .env .env

# Install dependencies
RUN set -ex; \
    yarn install --frozen-lockfile; \
    yarn setup; \
    yarn cache clean;

# Development stage. Uses yarn to start the server
FROM node:18-alpine AS development

# Set the working directory in development stage
WORKDIR /app/glific-frontend

# Copy the node modules and other build related steps from base stage
COPY --from=base /app/glific-frontend/ /app/glific-frontend/

# Copy all code/artifacts to working directory
COPY . /app/glific-frontend/

# Expose the desired port
EXPOSE 3000

#CMD ["ls", "-l"]
CMD ["yarn", "dev", "--host", "0.0.0.0", "--port", "3000"]

# Production build stage. Creates a build folder with the optimised build files
FROM node:18-alpine AS production

WORKDIR /app/glific-frontend

COPY . /app/glific-frontend/

# Run the optimised build
RUN yarn build

# Serve stage using Nginx
FROM nginx:latest AS serve

# Copies the "build/" folder from the "production" stage into the nginx web server root folder
COPY --from=production /app/glific-frontend/build /usr/share/nginx/html

# Overwrites the default nginx configuration with ssl setup and cert paths
COPY nginx.conf /etc/nginx/conf.d/default.conf