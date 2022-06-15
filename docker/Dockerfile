FROM node:16-alpine
RUN  apk add --no-cache ffmpeg imagemagick
WORKDIR /app
COPY . ./
RUN npm install
USER node
CMD ["npm", "start"]
