FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install dependencies with --ignore-scripts to skip problematic postinstall scripts
RUN npm install --ignore-scripts

# Copy application source code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application in development mode
CMD ["npm","run", "dev"]