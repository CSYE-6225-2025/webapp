const request = require("supertest");
const { sequelize, testDbConnection } = require("../config/db");
const app = require("../app");
const HealthzCheck = require("../model/healthz");

// database
beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync();
});

describe("Health Check Controller", () => {
  let transaction;

  beforeEach(async () => {
    transaction = await sequelize.transaction();
  });

  afterEach(async () => {
    await transaction.rollback();
  });

  it("should return 200 OK and insert a health check record if the DB connection is successful", async () => {
    // Send a GET request to your health check route (adjust URL as needed)
    const response = await request(app).get("/healthz");

    // Check if the response status is 200
    expect(response.status).toBe(201);

    // Check if the health check record was inserted
    const records = await HealthzCheck.findAll();
    expect(records.length).toBeGreaterThan(0); // Ensure that at least one record is inserted
    expect(records[0].datetime).toBeDefined(); // Check that the datetime is set
  });

  it("should return 503 Service Unavailable if the DB connection fails", async () => {
    // Mock DB connection failure
    jest.spyOn(HealthzCheck, "create").mockImplementation(() => {
      throw new Error("Database Connection Failed");
    });
    // Send a GET request to your health check route (adjust URL as needed)
    const response = await request(app).get("/healthz");

    // Check if the response status is 503
    expect(response.status).toBe(503);
    HealthzCheck.create.mockRestore();
  });

  it("should return 503 Service Unavailable if there's an error inserting the health check record", async () => {
    // Mock insertion failure by making HealthzCheck.create throw an error
    jest
      .spyOn(HealthzCheck, "create")
      .mockRejectedValue(new Error("Insertion error"));

    // Send a GET request to your health check route (adjust URL as needed)
    const response = await request(app).get("/healthz");

    // Check if the response status is 503
    expect(response.status).toBe(503);

    // Ensure that the create method was called
    expect(HealthzCheck.create).toHaveBeenCalled();
  });

  it("should return 405 Method Not Allowed for unsupported HTTP methods", async () => {
    // Simulating a POST request to a route that only accepts GET
    const response = await request(app).post("/healthz"); // Assuming /healthz route only accepts GET

    // Assert that the status is 405 Method Not Allowed
    expect(response.status).toBe(405);
  });

  it("should return 400 Bad Request if the request is invalid (e.g., missing parameters)", async () => {
    // Simulating a bad request by sending a GET request to /healthz without proper headers or parameters
    const response = await request(app)
      .get("/healthz")
      .send({ invalidField: "test" });

    // Assert that the status is 400 Bad Request
    expect(response.status).toBe(400);
  });
});

afterAll(async () => {
  await sequelize.close();
});
