require("dotenv").config();

module.exports = {
  development: {
    dialect: "mysql",
    database: "hybankus_api",
    username: "root",
    password: "",
    host: "127.0.0.1",
    port: parseInt(process.env.MYSQL_DB_PORT),
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
