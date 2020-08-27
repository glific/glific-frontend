FROM node:12.18.3-alpine AS builder
ARG REACT_APP_GLIFIC_API
ARG REACT_APP_WEB_SOCKET
ARG REACT_APP_FLOW_EDITOR_API

ENV REACT_APP_GLIFIC_API $REACT_APP_GLIFIC_API
ENV REACT_APP_WEB_SOCKET $REACT_APP_WEB_SOCKET
ENV REACT_APP_FLOW_EDITOR_API $REACT_APP_FLOW_EDITOR_API

WORKDIR /app
COPY . .
RUN npm install react-scripts -g --silent
RUN yarn install
RUN yarn run floweditor
RUN yarn run build

FROM node:12.18.3-alpine
RUN yarn global add serve
WORKDIR /app
COPY --from=builder /app/build .
CMD ["serve", "-p", "3000", "-s", "."]doc
