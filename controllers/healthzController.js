const { testDbConnection } = require("../config/db");
const HealthzCheck = require('../model/healthz');



const healthCheck = async (_, res) => {
    try {
        const dbConnection = await testDbConnection();
        if (dbConnection) {

            // Insert a record into the table
            await HealthzCheck.create({
                datetime: new Date().toISOString(), // Using current UTC timestamp
            });

            // If successful, return 200 OK
            return res.status(200).send();
        } else {
            // If DB connection is unsuccessful, return 503 Service Unavailable
            return res.status(503).send();
        }
    } catch (error) {
        console.error("Error inserting health check record:", error);
        // If there's an error inserting the record, return 503 Service Unavailable
        return res.status(503).send();
    }
};

module.exports = { healthCheck };
