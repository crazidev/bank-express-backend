import express, { Router, Request, Response } from "express";
import * as yup from "yup";
import { ValidationError, where } from "sequelize";
import { User } from "../../../models";

var router = express.Router();

router.post(
  "/admin/change-user-password",
  async (req: Request, res: Response) => {
    try {
      var field;
      let validator = yup.object({
        id: yup.string().required(),
        password: yup.string().required(),
      });

      try {
        field = validator.validateSync(req.body, {
          abortEarly: false,
          stripUnknown: true,
        });
      } catch (e) {
        const error = e as ValidationError;
        return res.status(422).json({ errors: error.errors });
      }

      await User.update(
        {
          password: field.password,
        },
        {
          where: {
            id: field.id,
          },
        }
      );

      return res.status(200).json({
        status: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);
module.exports = router;
