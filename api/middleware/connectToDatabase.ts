import db from "../database";
import { initModels } from "../models";

export const connectToDatabase = async (req: any, res: any, next: any) => {
  try {
    await db.authenticate();
    initModels(db);
    console.log("Connection has been established successfully.");

    next();
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    return res
      .status(500)
      .json({ message: "Unable to connect to the database." });
  }
};
