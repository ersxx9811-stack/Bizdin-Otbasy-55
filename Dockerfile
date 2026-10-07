FROM node:22-slim
WORKDIR /app
COPY package.json ./
RUN npm install --include=dev
COPY . .
RUN SLIM=1 npm run build
ENV PORT=8080 DATA_DIR=/data
VOLUME /data
EXPOSE 8080
CMD ["node", "server/server.mjs"]
