import express, { Router, Request, Response } from "express";
import * as yup from "yup";
import { ValidationError } from "sequelize";
import { User } from "../../../models";

var router = express.Router();

router.get("/admin/get-all-users", async (req: Request, res: Response) => {
  try {
    return res.status(200).json(await User.findAll({}));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
