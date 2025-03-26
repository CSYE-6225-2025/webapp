const { Sequelize } = require("sequelize");
require("dotenv").config({ path: process.env.NODE_ENV === "test" ? ".env.test.local" : ".env" });
const logger = require("../logger");

const MYSQL_DB = process.env.MYSQL_DB;
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_HOST = process.env.MYSQL_HOST;
const MYSQL_PORT = process.env.MYSQL_PORT;

const sequelize = new Sequelize(
    MYSQL_DB,
    MYSQL_USER,
    MYSQL_PASSWORD,
    {
        host: MYSQL_HOST,
        dialect: "mysql",
    },
    MYSQL_PORT
);

const testDbConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");
        return true;
    } catch (error) {
        console.error("Unable to connect to the database");
        logger.error({ error: "Unable to connect to the database" });
        return false;
    }
};

module.exports = {sequelize, testDbConnection };