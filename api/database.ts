import { Sequelize, Options } from "sequelize";
import configs from "./config/config.js";
import mysql from "mysql2";

const env = process.env.NODE_ENV || "development";
const config = (configs as { [key: string]: Options })[env];

// const db: Sequelize = new Sequelize('postgresql://postgres:postgres@127.0.0.1:54322/postgres', {
//   logging: true,
//   define: {
//     underscored: true
//   }
// })
//

const db: Sequelize = new Sequelize({
  ...config,
  dialectModule: mysql,
  define: {
    underscored: true,
  },
  logging: (sql, timing) => {
    if (process.env.LOG_DATABASE_QUERIES == "true") {
      console.info(sql);
    }
  },
});

export default db;
