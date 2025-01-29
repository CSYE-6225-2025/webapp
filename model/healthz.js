const { literal, DataTypes } = require("sequelize");
const {sq} = require('../config/db');

const HealthzCheck = sq.define(
    "HealthzCheck",
    {
        check_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true, // Auto increment for primary key
        },
        datetime: {
            type: DataTypes.DATE,
            defaultValue: literal('CURRENT_TIMESTAMP'), // Automatically use the current timestamp in UTC
            allowNull: false,
        }
    },
    {
        tableName: 'healthz_check',
        timestamps: false,      
    }
);

module.exports = HealthzCheck;