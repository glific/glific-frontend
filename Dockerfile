FROM node:20

# Create app directory
WORKDIR /app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the entire project to the working directory
COPY . .

# Build the production-ready app
RUN yarn build

# Expose the desired port
EXPOSE 3000

# Start the app
# CMD ["yarn", "serve"]
RUN /bin/sh
