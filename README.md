# webapp
Assignment 1: Building a Basic API with Node.js, Express, Sequelize, and MySQL
In this assignment, the goal is to create a simple API to test the connection to a local database and enter a record. The project utilizes Node.js, Express, Sequelize, and MySQL to showcase the required functionality.

Features
Healthz Endpoint
The API includes a healthz endpoint designed to perform a database connection test and enter a entry record.

To start database server use MYsql desktop app 

To verify the connection status, you can use the following curl request:
curl -vvvv http://localhost:8080/healthz
This request returns either "OK" or "Service Unavailable" based on the connection status and record entry.
Middleware Blocking Other HTTP Methods
The healthz endpoint has been secured by middleware to allow only specific HTTP methods.

To test this middleware, you can use the following curl requests:

POST request:
curl -vvvv -X PUT http://localhost:8080/healthz

DELETE request:
curl -vvvv -X DELETE http://localhost:8080/healthz

PATCH request:
curl -vvvv -X PATCH http://localhost:8080/healthz

About
The repository contains a rest-api which will be used to learn all different concepts about cloud computing and network structures

