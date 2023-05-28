# Use an official Node.js runtime as the base image
FROM node:16.15.0

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install project dependencies
RUN npm install

# Copy the entire project directory to the working directory
COPY . .

# Build the frontend application
RUN npm run build

# Specify the command to run when the container starts
CMD ["npm", "run", "start"]
