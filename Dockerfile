# Use an official Node.js 16.19-alpine runtime as a parent image
FROM node:16.19-alpine

# Define build-time variable
ARG MONGO_CONNECTION_STRING
ARG PORT
ARG ACCESS_TOKEN_SECRET
ARG REFRESH_TOKEN_SECRET
ARG TEST_PORT
ARG MONGO_CONNECTION_STRING_TEST_DB

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to /app
COPY package*.json ./

# Install dependencies
RUN npm i

# Copy source code to /app
COPY . .

# remove bcrypt package
RUN npm uninstall bcrypt

# install bcrypt package
RUN npm install bcrypt

# Set environment variables
ENV MONGO_CONNECTION_STRING=$MONGO_CONNECTION_STRING
ENV PORT=$PORT
ENV ACCESS_TOKEN_SECRET=$ACCESS_TOKEN_SECRET
ENV REFRESH_TOKEN_SECRET=$REFRESH_TOKEN_SECRET
ENV TEST_PORT=$TEST_PORT
ENV MONGO_CONNECTION_STRING_TEST_DB=$MONGO_CONNECTION_STRING_TEST_DB

# Expose the port that the server listens on
EXPOSE 5000

# Start the server
CMD [ "npm", "run", "start" ]
