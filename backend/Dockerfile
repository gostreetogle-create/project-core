FROM node:22-alpine

WORKDIR /app

# Copy package files and install production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

EXPOSE 3000

# tsx runs TypeScript directly — no tsc build needed
CMD ["npx", "tsx", "src/index.ts"]
