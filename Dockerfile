# Use an official Node.js runtime as a parent image
FROM node:20.17.0

# Set the working directory in the container
WORKDIR /usr/src/app

# Install AWS CLI
RUN apt-get update && apt-get install -y awscli

# Pass AWS credentials via build arguments
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG AWS_DEFAULT_REGION
ARG KUBE_CONFIG_S3

# Set AWS credentials as environment variables
ENV AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
ENV AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
ENV AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}
ENV KUBE_CONFIG_S3=${KUBE_CONFIG_S3}


# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the NestJS application
RUN npm run build

# Copy the kube config file into the container
RUN mkdir -p /root/.kube && \
    aws s3 cp ${KUBE_CONFIG_S3}/config /root/.kube/config

# Expose the port the app runs on
EXPOSE 7000

# Increase memory allocation
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Command to run the application
CMD ["npm", "run", "start:prod"]
