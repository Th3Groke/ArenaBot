FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recomends\
chromium \
fonts-liberation \
ca-certificates \
&& rm -rf /var/lib/apt/lists/*

# Pointing puppetter to the chromium binary installed on the system
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
USER node
CMD ["npm", "start"]
