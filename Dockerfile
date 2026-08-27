FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

COPY . .

EXPOSE 5000
CMD ["node", "server.js"]

