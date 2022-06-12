FROM node:16-alpine
WORKDIR /app
COPY . ./
RUN  apk add --no-cache ffmpeg imagemagick \
  && npm install
USER node
CMD ["npm", "start"]
