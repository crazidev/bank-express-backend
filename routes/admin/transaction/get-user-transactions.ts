import express, { Router, Request, Response } from "express";
import * as yup from "yup";
import { ValidationError } from "sequelize";
import { Transaction, User } from "../../../models";

var router = express.Router();

router.get("/admin/getTransactions", async (req: Request, res: Response) => {
  try {
    return res.status(200).json(
      await Transaction.findAll({
        include: [{ model: User }],
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
