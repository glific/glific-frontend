FROM node:12-alpine AS builder

# Any env variables will be passed as arg here to make these available at build time.
ARG VITE_GLIFIC_API_PORT

# Add those arg as env variable for builder
ENV VITE_GLIFIC_API_PORT $VITE_GLIFIC_API_PORT

WORKDIR /app
COPY . .
RUN npm install react-scripts -g --silent
RUN yarn install
RUN yarn run build

FROM node:12-alpine
RUN yarn global add serve
WORKDIR /app
COPY --from=builder /app/build .
CMD ["serve", "-p", "3000", "-s", "."]doc
