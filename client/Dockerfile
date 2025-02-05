# Use Node.js as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the React app
RUN npm run build

# Expose the correct port for Vite Preview
EXPOSE 4173

# Ensure Vite binds to 0.0.0.0 for Cloud Run
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]