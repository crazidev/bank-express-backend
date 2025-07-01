import express, { Request, Response } from "express";
import { Bank, Livechat, Transaction, User } from "../../../models";
import { DATE, Op } from "sequelize";
import * as yup from "yup";
import mime from "mime-types";
import fileUpload, { UploadedFile } from "express-fileupload";
const crypto = require("crypto");
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

var router = express.Router();

router.get("/admin/livechat", async function (req: any, res: Response) {
  const timeAgo = new TimeAgo("en-US");

  var field;
  let validator = yup.object({
    user_id: yup.number().required(),
  });

  try {
    field = validator.validateSync(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });
  } catch (e) {
    const error = e as yup.ValidationError;
    return res.status(422).json({ errors: error.errors });
  }

  var livechat = await Livechat.findAll({
    where: {
      userId: field.user_id,
    },
    order: [["id", "DESC"]],
  });

  var user = await User.findByPk(field.user_id);

  return res.json({ livechat, lastseen: timeAgo.format(user?.lastSeen!) });
});

module.exports = router;
