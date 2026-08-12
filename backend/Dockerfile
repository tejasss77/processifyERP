FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL required by Prisma in Alpine
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Generate Prisma Client and build TypeScript project
RUN npx prisma generate
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install OpenSSL required by Prisma query engine in Alpine Linux
RUN apk add --no-cache openssl

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy compiled code and Prisma assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Set default environment variables
ENV PORT=5001
ENV NODE_ENV=production
ENV DATABASE_URL="file:./prisma/dev.db"

EXPOSE 5001

# Run Prisma db push in non-interactive mode, seed default admin accounts, then start server
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && (node dist/seed.js || true) && node dist/server.js"]
