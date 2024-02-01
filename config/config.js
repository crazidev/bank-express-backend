require("dotenv").config();

module.exports = {
  development: {
    dialect: "sqlite",
    storage: process.env.SQLITE || "sqlite.db",
  },
  production: {
    dialect: "mysql",
    database: process.env.MYSQL_DB_NAME,
    username: process.env.MYSQL_DB_USERNAME,
    password: process.env.MYSQL_DB_PASSWORD,
    host: process.env.MYSQL_DB_HOST,
    port: parseInt(process.env.MYSQL_DB_PORT),
  },
};
