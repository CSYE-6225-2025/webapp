packer {
  required_plugins {
    amazon-ebs = {
      source  = "github.com/hashicorp/amazon"
      version = ">= 1.0.0"
    }
  }
}

variable "aws_region" {
  default = "us-east-1"
}

variable "mysql_host" {
  default = "localhost"
}

variable "mysql_root_password" {
  description = "The root password for MySQL"
  type        = string
  default     = "default"
}

variable "mysql_database" {
  default = "csye6225"
}

variable "port" {
  default = "3306"
}

variable "ami_users" {
  type    = list(string)
  default = ["047719652773"] # Replace with your demo AWS Account ID(s)
}

source "amazon-ebs" "webapp_custom_image" {
  region        = var.aws_region
  ami_name      = "custom-aws-webapp-{{timestamp}}"
  instance_type = "t2.micro"
  source_ami    = "ami-04b4f1a9cf54c11d0"

  # Instance Configuration
  ssh_username                = "ubuntu"
  associate_public_ip_address = true

  #share image with the demo
  ami_users = var.ami_users
}

build {
  name = "custom-aws-webapp-{{timestamp}}"
  sources = [
    "source.amazon-ebs.webapp_custom_image"
  ]

  provisioner "file" {
    source      = "../webapp.zip"
    destination = "/home/ubuntu/webapp.zip"
  }

  # Copy the config file
  provisioner "file" {
    source      = "cloudwatch-agent-config.json"
    destination = "/tmp/cloudwatch-agent-config.json"
  }

  # Copy the installation script
  provisioner "file" {
    source      = "install_cloudwatch_agent.sh"
    destination = "/tmp/install_cloudwatch_agent.sh"
  }

  # Provision MySQL, Node.js, and setup
  provisioner "shell" {
    environment_vars = ["DEBIAN_FRONTEND=noninteractive"]


    inline = [
      # Update the package list
      "sudo apt update",

      # Install required packages
      "sudo apt install -y nodejs",
      "sudo apt install unzip -y",
      "sudo apt install npm -y", # Install npm for testing

      "if ! command -v aws &> /dev/null; then",
      "  curl \"https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip\" -o \"awscliv2.zip\"",
      "  unzip awscliv2.zip",
      "  sudo ./aws/install",
      "  rm -rf awscliv2.zip aws",
      "fi",
      "aws --version",

      "ls -l /home/ubuntu/webapp.zip",
      "sudo chmod 644 /home/ubuntu/webapp.zip",

      # making csye6225
      "sudo mkdir /opt/csye6225/",

      # Unzip the application files
      "sudo unzip /home/ubuntu/webapp.zip -d /opt/csye6225/webapp",

      # Create the user and group
      "sudo groupadd csye6225",
      "sudo useradd -r -s /usr/sbin/nologin -g csye6225 csye6225",

      # Change ownership of the application files
      "sudo chown -R csye6225:csye6225 /opt/csye6225/",

      # Ensure read/write/execute permissions for the owner
      "sudo chmod -R 755 /opt/csye6225/",

      # Navigate to the webapp directory
      "cd /opt/csye6225/webapp && sudo npm install", # Install dependencies

      # Create systemd service
      "echo '[Unit]\\nDescription=CSYE 6225 App\\nAfter=network.target\\n\\n[Service]\\nType=simple\\nUser=csye6225\\nGroup=csye6225\\nWorkingDirectory=/opt/csye6225/webapp\\nExecStart=/usr/bin/node /opt/csye6225/webapp/server.js\\nRestart=always\\nRestartSec=3\\nStandardOutput=syslog\\nStandardError=syslog\\nSyslogIdentifier=csye6225\\n\\n[Install]\\nWantedBy=multi-user.target' | sudo tee /etc/systemd/system/csye6225.service > /dev/null",

      # Reload systemd to recognize the new service
      "sudo systemctl daemon-reload",

      # Enable the service to start on boot
      "sudo systemctl enable csye6225.service"

    ]
  }

  # Provision Cloud-watch agent
  provisioner "shell" {
    inline = [
      "chmod +x /tmp/install_cloudwatch_agent.sh",
      "sudo /tmp/install_cloudwatch_agent.sh"
    ]
  }
}