FROM node:18-alpine

# Create app directory
WORKDIR /app/glific-frontend

# Install dependencies
RUN apk add --no-cache --update \
    build-base git curl vim zsh inotify-tools openssl ncurses-libs esbuild
 
# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./
COPY .env.example ./.env

# Install dependencies
RUN set -ex; \
    yarn install --frozen-lockfile --production; \
    yarn cache clean;
    
# Copy the entire project to the working directory
COPY . .

# Build the production-ready app
# RUN yarn build

# Expose the desired port
EXPOSE 3000

# Start the app
# CMD ["yarn", "serve"]
CMD ["tail", "-f", "/dev/null"]
