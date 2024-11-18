#!/bin/bash

# Configuration
APP_DIR="/opt/caf-client"
SERVICE_NAME="cafclient"
SERVICE_FILE="deployment/systemd/cafclient.service"

# Stop existing service
sudo systemctl stop $SERVICE_NAME

# Build the application
echo "Building application..."
npm run dist-linux

# Create installation directory
sudo mkdir -p $APP_DIR

# Copy new files
echo "Copying files..."
sudo cp -r dist/linux-arm64-unpacked/* $APP_DIR/

# Copy service file
echo "Installing service..."
sudo cp $SERVICE_FILE /etc/systemd/system/

# Set permissions
sudo chown -R user:user $APP_DIR
sudo chmod +x $APP_DIR/caf-client

# Reload systemd and restart service
echo "Starting service..."
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME
sudo systemctl start $SERVICE_NAME

echo "Deployment complete!" 