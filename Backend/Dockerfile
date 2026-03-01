# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Create temp directory for file uploads
RUN mkdir -p public/temp

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "app.js"]
