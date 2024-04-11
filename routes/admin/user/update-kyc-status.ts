import express, { Router, Request, Response } from "express";
import * as yup from "yup";
import { ValidationError, where } from "sequelize";
import { User } from "../../../models";

var router = express.Router();

router.post("/admin/update-kyc-status", async (req: Request, res: Response) => {
  try {
    var field;
    let validator = yup.object({
      id: yup.string().required(),
      emailVerified: yup.boolean().required(),
      status: yup.mixed().oneOf(["blocked", "active", "suspended"]).required(),
      ssn_status: yup.mixed().oneOf(["verified", "uploaded", "pending"]).required(),
      is_doc_status: yup.mixed().oneOf(["verified", "uploaded", "pending"]).required(),
      tier: yup.mixed().oneOf(["tier1", "tier2", "tier3"]).required(),
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
        ssnStatus:
          field.ssn_status == "pending" ? null : (field.ssn_status as any),
          status: field.status as any,
          emailVerified: field.emailVerified,
          accountLevel: field.tier as any,
        idDocStatus:
          field.is_doc_status == "pending"
            ? null
            : (field.is_doc_status as any),
      },
      {
        where: {
          id: field.id,
        },
      }
    );

    return res.status(200).json({
      status: true,
      message: "KYC status updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
