variable "gcp_project_id" {
  default = "webapp-dev-452004"
}

variable "image_name" {
  default = "custom-ubuntu-24-04"
}

variable "machine_type" {
  default = "e2-micro"
}

variable "zone" {
  default = "us-central1-a"
}

variable "mysql_host" {
  default = "localhost"
}

variable "mysql_root_password" {
  description = "The root password for MySQL"
  type        = string
  default     = "default"
}

variable "mysql_db" {
  default = "csye6225"
}

variable "port" {
  default = "3306"
}

source "googlecompute" "ubuntu" {
  project_id          = var.gcp_project_id
  source_image_family = "ubuntu-2404-lts-amd64"
  source_image        = "ubuntu-2404-noble-amd64-v20250214"
  machine_type        = var.machine_type
  zone                = var.zone
  image_name          = var.image_name
  image_family        = "custom-ubuntu"
  image_description   = "Custom Ubuntu 24.04 LTS Image"
  disk_size           = 10
  ssh_username        = "ubuntu"
}

build {
  sources = [
    "source.googlecompute.ubuntu"
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

      # Change authentication method in MySQL
      "sudo mysql -u root -p'${var.mysql_root_password}' -e \"ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${var.mysql_root_password}';\"",

      # Create the database in the RDBMS
      "sudo mysql -u root -p'${var.mysql_root_password}' -e \"CREATE DATABASE ${var.mysql_db};\"",

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
      "sudo bash -c 'echo \"[Unit]\" > /etc/systemd/system/csye6225.service && echo \"Description=CSYE 6225 App\" >> /etc/systemd/system/csye6225.service && echo \"ConditionPathExists=/opt/application.properties\" >> /etc/systemd/system/csye6225.service && echo \"After=network.target\" >> /etc/systemd/system/csye6225.service && echo \"\" >> /etc/systemd/system/csye6225.service && echo \"[Service]\" >> /etc/systemd/system/csye6225.service && echo \"Type=simple\" >> /etc/systemd/system/csye6225.service && echo \"User=csye6225\" >> /etc/systemd/system/csye6225.service && echo \"Group=csye6225\" >> /etc/systemd/system/csye6225.service && echo \"WorkingDirectory=/opt/app\" >> /etc/systemd/system/csye6225.service && echo \"ExecStart=/opt/app/healthcheck\" >> /etc/systemd/system/csye6225.service && echo \"Restart=always\" >> /etc/systemd/system/csye6225.service && echo \"RestartSec=3\" >> /etc/systemd/system/csye6225.service && echo \"StandardOutput=syslog\" >> /etc/systemd/system/csye6225.service && echo \"StandardError=syslog\" >> /etc/systemd/system/csye6225.service && echo \"SyslogIdentifier=csye6225\" >> /etc/systemd/system/csye6225.service && echo \"\" >> /etc/systemd/system/csye6225.service && echo \"[Install]\" >> /etc/systemd/system/csye6225.service && echo \"WantedBy=multi-user.target\" >> /etc/systemd/system/csye6225.service'",

      # Reload systemd to recognize the new service
      "sudo systemctl daemon-reload",

      # Enable the service to start on boot
      "sudo systemctl enable csye6225.service"

    ]
  }
}