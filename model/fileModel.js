const { DataTypes, literal } = require("sequelize");
const { sequelize } = require("../config/db");

const File = sequelize.define(
  "File",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // Automatically generate UUID
      primaryKey: true,
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: false, // File name is required
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: false, // URL is required
    },
    upload_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: "files", // Table name in the database
    timestamps: false, // Disable Sequelize's automatic timestamps
  }
);

module.exports = File;
