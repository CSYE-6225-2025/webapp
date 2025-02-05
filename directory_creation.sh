#!/usr/bin/env bash

# Export env vars
source .env
echo "SSH Path: $SSH_PATH"

scp -i "$SSH_PATH" "$YOUR_DIR_FOLDER_PATH/webapp-copy.zip" "$UBUNTU_USERNAME"@"$UBUNTU_IP_ADDRESS":/opt

scp -i "$SSH_PATH" "$YOUR_DIR_FOLDER_PATH/webapp-copy/ubuntu.env" "$UBUNTU_USERNAME"@"$UBUNTU_IP_ADDRESS":/opt

scp -i "$SSH_PATH" "$YOUR_DIR_FOLDER_PATH/webapp-copy/ubuntu.sh" "$UBUNTU_USERNAME"@"$UBUNTU_IP_ADDRESS":/opt

ssh -i "$SSH_PATH" "$UBUNTU_USERNAME"@"$UBUNTU_IP_ADDRESS" "chmod +x /opt/ubuntu.sh"