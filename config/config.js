require("dotenv").config();

module.exports = {
  development: {
    dialect: "sqlite",
    storage: process.env.SQLITE || "sqlite.db",
  },
  production: {
    dialect: "sqlite",
    storage: process.env.SQLITE || "sqlite.db",
  },
};
