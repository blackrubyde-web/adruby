FROM node:20-slim

# Install fonts and dependencies for Sharp
RUN apt-get update && apt-get install -y \
    fonts-inter \
    fonts-liberation \
    fontconfig \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

# Rebuild font cache
RUN fc-cache -f -v

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY src ./src
COPY fonts ./fonts

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "src/index.js"]
