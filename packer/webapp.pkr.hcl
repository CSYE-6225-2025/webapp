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

source "amazon-ebs" "webapp_custom_image" {
  region        = var.aws_region
  profile       = "webapp_ec2"
  ami_name      = "custom-aws-webapp-{{timestamp}}"
  instance_type = "t2.micro"
  source_ami    = "ami-04b4f1a9cf54c11d0"

  # Instance Configuration
  ssh_username                = "ubuntu"
  associate_public_ip_address = true
}

build {
  name = "custom-aws-webapp-{{timestamp}}"
  sources = [
    "source.amazon-ebs.webapp_custom_image"
  ]

  # Copy application artifacts to the instance
  provisioner "file" {
    source      = "../webapp.zip"
    destination = "/home/ubuntu/webapp.zip"
  }

  # Provision MySQL, Node.js, and setup
  provisioner "shell" {
    environment_vars = ["DEBIAN_FRONTEND=noninteractive"]


    inline = [
      # Update the package list
      "sudo apt update",

      # Install required packages
      "sudo apt install -y nodejs",
      "sudo apt install mysql-server -y",
      "sudo apt install unzip -y",
      "sudo apt install npm -y", # Install npm for testing

      "ls -l /home/ubuntu/webapp.zip",
      "sudo chmod 644 /home/ubuntu/webapp.zip",

      "ls -l /home/ubuntu/ubuntu.env",
      "sudo chmod 644 /home/ubuntu/ubuntu.env", # Ensure permissions for the env file

      # Change authentication method in MySQL
      "sudo mysql -u root -p'${var.mysql_root_password}' -e \"ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${var.mysql_root_password}';\"",

      # Create the database in the RDBMS
      "sudo mysql -u root -p'${var.mysql_root_password}' -e \"CREATE DATABASE ${var.mysql_database};\"",

      # making csye6225
      "sudo mkdir /opt/csye6225/",

      # Unzip the application files
      "sudo unzip /home/ubuntu/webapp.zip -d /opt/csye6225/",

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
      "sudo bash -c 'echo \"[Unit]\" > /etc/systemd/system/csye6225.service && echo \"Description=CSYE 6225 App\" >> /etc/systemd/system/csye6225.service && echo \"ConditionPathExists=/opt/application.properties\" >> /etc/systemd/system/csye6225.service && echo \"After=network.target\" >> /etc/systemd/system/csye6225.service && echo \"\" >> /etc/systemd/system/csye6225.service && echo \"[Service]\" >> /etc/systemd/system/csye6225.service && echo \"Type=simple\" >> /etc/systemd/system/csye6225.service && echo \"User=csye6225\" >> /etc/systemd/system/csye6225.service && echo \"Group=csye6225\" >> /etc/systemd/system/csye6225.service && echo \"WorkingDirectory=/opt/app\" >> /etc/systemd/system/csye6225.service && echo \"ExecStart=/opt/app/healthcheck\" >> /etc/systemd/system/csye6225.service && echo \"Restart=always\" >> /etc/systemd/system/csye6225.service && echo \"RestartSec=3\" >> /etc/systemd/system/csye6225.service && echo \"StandardOutput=syslog\" >> /etc/systemd/system/csye6225.service && echo \"StandardError=syslog\" >> /etc/systemd/system/csye6225.service && echo \"SyslogIdentifier=csye6225\" >> /etc/systemd/system/csye6225.service && echo \"\" >> /etc/systemd/system/csye6225.service && echo \"[Install]\" >> /etc/systemd/system/csye6225.service && echo \"WantedBy=multi-user.target\" >> /etc/systemd/system/csye6225.service'",



      # Reload systemd to recognize the new service
      "sudo systemctl daemon-reload",

      # Enable the service to start on boot
      "sudo systemctl enable csye6225.service"

    ]
  }
}
