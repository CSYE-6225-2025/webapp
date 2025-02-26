# webapp

testing the webapp github flow,
Hello, friends....testing take 145
# Assignment 2: AWS Organization Setup

In this assignment,Set up AWS Organizations with **dev** and **demo** accounts, configure IAM with a `csye6225-ta` group for TAs, and automate Ubuntu 24.04 app setup via a shell script. Implement API tests with REST Assured or similar, storing them in a separate repository folder.

## Features

#### AWS Organizations Setup 
– Create dev and demo member accounts for development and grading

#### IAM Configuration
– Set up a csye6225-ta group with ReadOnlyAccess for teaching assistants in the DEMO AWS account.

#### Automated System Setup
– Write a shell script for Ubuntu 24.04 LTS to update packages, install an RDBMS, create a database, set up user permissions, and deploy the application in /opt/csye6225.

#### Secure Access Control
– Only the root user can modify resources; TAs get restricted read-only access.

#### API Testing Framework
– Implement automated API tests using REST Assured or a similar framework, validating success and failure scenarios.

#### Organized Codebase
– Store API tests separately in the web app repository for maintainability.

# Assignment 1: Building a Basic API with Node.js, Express, Sequelize, and MySQL
In this assignment, the goal is to create a simple API to test the connection to a local database and enter a record. The project utilizes Node.js, Express, Sequelize, and MySQL to showcase the required functionality.

## Features
Healthz Endpoint
The API includes a healthz endpoint designed to perform a database connection test and enter a entry record.

To start database server use MYsql desktop app 

To verify the connection status, you can use the following curl request:
curl -vvvv http://localhost:8080/healthz
This request returns either "OK" or "Service Unavailable" based on the connection status and record entry.
Middleware Blocking Other HTTP Methods
The healthz endpoint has been secured by middleware to allow only specific HTTP methods.

To test this middleware, you can use the following curl requests:

### POST request:
curl -vvvv -X PUT http://localhost:8080/healthz

### DELETE request:
curl -vvvv -X DELETE http://localhost:8080/healthz

### PATCH request:
curl -vvvv -X PATCH http://localhost:8080/healthz

###### About
The repository contains a rest-api which will be used to learn all different concepts about cloud computing and network structures

test
