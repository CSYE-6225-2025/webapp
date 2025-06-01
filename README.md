###Project Overview
This project is a comprehensive demonstration of cloud application development and deployment, emphasizing robust security and high availability:

##RESTful Application Development & Enhanced CI:

Developed a scalable RESTful application, with Continuous Integration via GitHub Actions ensuring code reliability and quality.
Integrated detailed logging and metrics for effective monitoring and performance analysis.
Application Scaling and Event-Driven Architecture:

Implemented AutoScaling for dynamic capacity management.
Used Amazon SNS for an efficient, event-driven architecture.
AMI Creation and Userdata Scripting:

Customized Amazon Machine Images (AMI) for a consistent deployment environment.
Leveraged userdata scripts for automated instance configuration.
Robust Infrastructure Deployment with Security:

Deployed a secure AWS infrastructure, with a focus on network and resource isolation.
Utilized IAM roles and security groups to enforce strict access controls and security best practices.
Configured the Application Load Balancer to only accept HTTPS requests, enhancing data security in transit, with SSL/TLS certificates managed through AWS Certificate Manager (ACM).
Employed Route 53 for reliable domain registration and DNS management.
Lambda Functions for Automated Operations:

Integrated AWS Lambda for automated responses to specific events, streamlining operations and increasing efficiency.
💻 List of Cloud services used:
🌍 Route 53 (DNS service)
🌐 VPC (Virtual private cloud)
⚖️ Application Load Balancer (ALB)
🔏 Certificate Manager (Security In transit)
⚖️ Auto Scaling group (Scale on demand)
💻 EC2 (Virtual Server)(Debian OS)
🗄️ RDS (Relational database service)
☁️ GCS (Google Cloud Storage)
🔍 CloudWatch (Logs and metrics)
CI/CD


📘 Key Takeaways
Gained comprehensive knowledge in deploying and managing cloud-based applications using AWS services
Learned to leverage Pulumi for infrastructure orchestration, appreciating the power of using a high-level language like Python for infrastructure management
Gained practical experience in implementing security measures like IAM roles, security groups, and SSL/TLS with ACM, ensuring secure and reliable application environments
Gained experience in using Route 53 for domain registration and DNS management, understanding its role in a cloud environment
🛠️ Code
For more specific implementation details, visit the repos :

Application and REST APIs : https://github.com/csye6225-swetha/webapp
Infrastructure : https://github.com/csye6225-swetha/iac-pulumi
Lambda Function : https://github.com/csye6225-swetha/serverless
