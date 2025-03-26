#!/bin/bash

# Exit immediately if any command fails and print commands as they execute
set -ex

echo "=== STARTING CLOUDWATCH AGENT INSTALLATION ==="

# 1. Install CloudWatch Unified Agent
echo "Installing CloudWatch Unified Agent..."
wget -q https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
rm -f ./amazon-cloudwatch-agent.deb

# 2. Verify Agent Installation
echo "Verifying installation..."
if [ ! -f "/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl" ]; then
    echo "ERROR: CloudWatch Agent installation failed!"
    exit 1
fi

# 3. Set Up Configuration
echo "Configuring CloudWatch Agent..."
sudo mkdir -p /opt/aws/amazon-cloudwatch-agent/etc

# Verify config file exists before moving it
if [ ! -f "/tmp/cloudwatch-agent-config.json" ]; then
    echo "ERROR: CloudWatch config file not found in /tmp!"
    exit 1
fi

sudo mv /tmp/cloudwatch-agent-config.json /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
sudo chown root:root /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
sudo chmod 644 /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json

# 4. Verify Configuration File
echo "Verifying configuration..."
if ! sudo grep -q '"logs"' /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json; then
    echo "ERROR: Invalid CloudWatch config file!"
    exit 1
fi

# 5. Set Up Logs Directory
# echo "Creating logs directory..."
# sudo mkdir -p /opt/csye6225/webapp/logs
# sudo chown csye6225:csye6225 /opt/csye6225/webapp/logs
# sudo chmod 755 /opt/csye6225/webapp/logs

# 6. Configure and Enable Agent (without starting)
echo "Configuring and enabling CloudWatch Agent (will start at boot)..."
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json

sudo systemctl enable amazon-cloudwatch-agent.service

# # 7. Verify Configuration (skip service status check since we're not starting)
# echo "Verifying agent configuration..."
# sleep 10
# if ! sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -m ec2 -a status | grep -q '"status":"configured"'; then
#     echo "ERROR: CloudWatch Agent configuration failed!"
#     exit 1
# fi

echo "=== CLOUDWATCH AGENT INSTALLATION COMPLETED SUCCESSFULLY ==="
echo "Note: Agent will start automatically on instance boot"
