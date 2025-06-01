# File Management System

A Node.js application that provides RESTful APIs for file management with user authentication and AWS deployment capabilities.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [CI/CD Pipeline](#cicd-pipeline)
- [Running Tests](#running-tests)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

This Node.js application serves as a File Management System, providing functionality for users to upload files, retrieve file metadata, and delete files. The system features user authentication implemented through basic HTTP authentication using email and password, ensuring secure and controlled access.

## Features

- ✅ File upload with validation
- ✅ File metadata retrieval
- ✅ Secure file deletion
- ✅ User authentication (Basic HTTP)
- ✅ Database health checks
- ✅ CI/CD pipeline integration
- ✅ AWS AMI deployment support
- ✅ Custom metrics collection with StatsD

## Technologies Used

- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web application framework
- **Sequelize** - Promise-based ORM
- **MySQL** - Relational database
- **BCrypt** - Password hashing
- **AWS SDK** - AWS services integration
- **Multer** - File upload middleware
- **StatsD** - Metrics collection
- **GitHub Actions** - CI/CD automation
- **Packer** - AMI creation

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js** v20.x or higher
- **npm** v9.x or higher
- **MySQL** 8.0 or higher
- **Git** for version control
- **AWS CLI** (optional, for deployment)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/file-management-system.git
   cd file-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```sql
   CREATE DATABASE file_management_db;
   ```

4. **Run database migrations**
   ```bash
   npm run migrate
   ```

5. **Start the application**
   ```bash
   # Using node directly
   node server.js

   # Or if you have npm scripts configured
   npm start
   ```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=file_management_db

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_FILE_TYPES=.jpg,.jpeg,.png,.pdf,.doc,.docx,.zip

# Authentication
JWT_SECRET=your_jwt_secret_key
BCRYPT_ROUNDS=10

# AWS Configuration (Optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your_bucket_name

# StatsD Configuration (Optional)
STATSD_HOST=localhost
STATSD_PORT=8125
```

## API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication
All endpoints (except `/healthz` and `/cicd`) require Basic HTTP Authentication:
```
Authorization: Basic <base64(email:password)>
```

### Endpoints

#### Health Check
```http
GET /healthz
```
**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Upload File
```http
POST /v1/file
Content-Type: multipart/form-data
```
**Request Body:**
- `file`: The file to upload (required)

**Response:**
```json
{
  "id": "uuid-string",
  "filename": "document.pdf",
  "size": 1024567,
  "mimetype": "application/pdf",
  "uploadDate": "2024-01-01T00:00:00.000Z",
  "owner": {
    "id": "user-uuid",
    "email": "user@example.com"
  }
}
```

#### Get File Metadata
```http
GET /v1/file/:id
```
**Response:**
```json
{
  "id": "uuid-string",
  "filename": "document.pdf",
  "size": 1024567,
  "mimetype": "application/pdf",
  "uploadDate": "2024-01-01T00:00:00.000Z",
  "owner": {
    "id": "user-uuid",
    "email": "user@example.com"
  }
}
```

#### Delete File
```http
DELETE /v1/file/:id
```
**Response:**
```
204 No Content
```

#### CI/CD Health Check
```http
GET /cicd
```
**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "deploymentId": "deployment-123",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Responses

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

Common error codes:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `413` - File Too Large
- `415` - Unsupported Media Type
- `500` - Internal Server Error

## CI/CD Pipeline

### Continuous Integration (CI)

The CI pipeline runs on every pull request and includes:

1. **Code Quality Checks**
   - Linting with ESLint
   - Code formatting with Prettier
   - Security vulnerability scanning

2. **Testing**
   - Unit tests
   - Integration tests
   - API endpoint tests

3. **Build Validation**
   - Node.js build verification
   - Dependency checks

4. **Packer Validation**
   - AMI configuration validation
   - Build script verification

### Continuous Deployment (CD)

The CD pipeline triggers on main branch merges:

1. **AMI Building**
   - Creates custom AMI using Packer
   - Installs application and dependencies
   - Configures system services

2. **Deployment**
   - Deploys AMI to AWS
   - Updates Auto Scaling Groups
   - Performs health checks

## Running Tests

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Deployment

### Local Development
```bash
node server.js
```

### Production Build
```bash
# Set production environment
export NODE_ENV=production
node server.js
```

### Docker Deployment
```bash
# Build Docker image
docker build -t file-management-system .

# Run container
docker run -p 3000:3000 --env-file .env file-management-system
```

### AWS Deployment
```bash
# Validate Packer configuration
packer validate packer.json

# Build AMI
packer build packer.json

# Deploy using AWS CLI or console
```

## Project Structure

```
file-management-system/
├── .github/
│   └── workflows/      # GitHub Actions CI/CD workflows
├── config/             # Configuration files
├── controllers/        # Request handlers
├── model/              # Database models
├── routes/             # API routes
├── services/           # Business logic layer
├── tests/              # Test files
├── packer/             # Packer configurations for AMI
├── .gitignore          # Git ignore file
├── README.md           # Project documentation
├── app.js              # Express app entry point
├── directory_creation.sh # Shell script for directory setup
├── logger.js           # Logging configuration
├── metrics.js          # StatsD metrics configuration
├── package.json        # Project dependencies
├── package-lock.json   # Locked dependencies
└── server.js           # Server startup file
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

### Coding Standards

- Follow ESLint rules
- Write unit tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check MySQL service status
sudo systemctl status mysql

# Verify credentials in .env file
```

**Port Already in Use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process or change PORT in .env
```

**File Upload Issues**
- Check file size limits in configuration
- Verify allowed file types
- Ensure upload directory has write permissions

## Security

- All passwords are hashed using BCrypt
- File uploads are validated and sanitized
- SQL injection prevention through Sequelize ORM
- Authentication required for all file operations
- Regular security updates and dependency audits
