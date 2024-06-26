import express, { Router, Request, Response } from "express";
import * as yup from "yup";
import { Transaction, User } from "../../../models";

var router = express.Router();

router.post(
  "/admin/delete-transaction",
  async (req: Request, res: Response) => {
    try {
      var field;
      let validator = yup.object({
        id: yup.number().required(),
      });

      try {
        field = validator.validateSync(req.body, {
          abortEarly: false,
          stripUnknown: true,
        });
      } catch (e) {
        const error = e as yup.ValidationError;
        return res.status(422).json({ errors: error.errors });
      }

      await Transaction.destroy({
        where: {
          id: field.id,
        },
      });

      return res.status(200).json({
        status: true,
        message: "Transasction deleted successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);
module.exports = router;
