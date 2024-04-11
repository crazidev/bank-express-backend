import express, { Router, Request, Response } from "express";
import * as yup from "yup";
import { Bank, Transaction, User, Wallet } from "../../../models";
import { v4 as uuid } from "uuid";
import sendMail from "../../../middleware/mailer";
import { transferReceivedEmail } from "../../../middleware/email-templates";
import { APP_NAME } from "../../../config/constants";

var router = express.Router();
const moment = require("moment");

router.post(
  "/admin/create-transaction",
  async (req: Request, res: Response) => {
    try {
      const { body } = req;
      var reference = uuid();
      const transactionSchema = defineInputSchema();
      var field = await validateInput(body);
      var newTransaction: Transaction | undefined;

      var user = await User.findByPk(field.userId);

      await createNewTransaction();

      return res.status(200).json({
        status: true,
        message: "Transfer successful",

        transaction: await Transaction.findByPk(newTransaction?.id, {
          include: [
            {
              model: Bank,
              as: "bank",
            },
            {
              model: Wallet,
              as: "wallet",
            },
            {
              model: User,
              as: "user",
              required: false,
              attributes: [
                "firstName",
                "lastName",
                "email",
                "profileImg",
                "id",
              ],
            },
            {
              model: User,
              as: "beneficiary",
              required: false,
              attributes: [
                "firstName",
                "lastName",
                "email",
                "profileImg",
                "id",
              ],
            },
          ],
        }),
      });

      function defineInputSchema() {
        return yup.object().shape({
          amount: yup.number().required(),
          bankId: yup.number().required(),
          narration: yup.string().required(),
          userId: yup.number().required(),
          beneficiaryId: yup.number(),
          beneficiary_name: yup.string().required(),
          update_balance: yup.boolean().required(),
          type: yup.string().oneOf(["debit", "credit"]).required(),
          status: yup.string().oneOf(["pending", "completed"]).required(),
          sendFrom: yup
            .string()
            .oneOf(["inter_wallet", "crypto_wallet"])
            .required(),
        });
      }

      async function validateInput(body: any) {
        return await transactionSchema.validate(body, {
          abortEarly: false,
          stripUnknown: true,
        });
      }

      async function createNewTransaction() {
        if (field.sendFrom == "inter_wallet") {
          newTransaction = await Transaction.create({
            amount: field.amount,
            paymentMethod: "bank_transfer",
            narration: field.narration,
            status: field.status,
            userId: field.type == "debit" ? field.userId : field.beneficiaryId,
            beneficiaryId:
              field.type == "credit" ? field.userId : field.beneficiaryId,
            beneficiaryName: field.beneficiary_name,
            reference: reference,
          });

          if (field.update_balance) {
            if (field.type == "credit") {
              await User.increment("accountBalance", {
                by: field.amount,
                where: {
                  id: field.beneficiaryId,
                },
              });
            }
          }
        }
      }

      // function sendEmailNotificationToReceiver(beneficiary: User) {
      //   const currentDate = moment();
      //   const formattedDate = currentDate.format("YYYY-MM-DD HH:mmA");

      //   sendMail({
      //     to: beneficiary.email!,
      //     subject: "Transfer Received - Confirmation",
      //     html: transferReceivedEmail({
      //       name: beneficiary.firstName,
      //       new_balance: `$${beneficiary.accountBalance}`,
      //       sender_name: `${field?.beneficiary_name}`,
      //       sender_account: `${sender?.id} (${APP_NAME})`,
      //       reference: reference,
      //       date: formattedDate,
      //       amount: `$${field.amount}`,
      //     }),
      //     res: res,
      //   });
      // }
    } catch (e) {
      const error = e as yup.ValidationError;
      return res.status(400).json({ error: error.errors, stack: e });
    }
  }
);
module.exports = router;
