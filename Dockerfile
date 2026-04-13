# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY server/package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code to the working directory
COPY server/ ./

# Expose the port that the application will run on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]