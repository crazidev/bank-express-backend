// Import required modules and models
import express, { Router, Request, Response } from "express";
import { Bank, Transaction, User, Wallet, WalletBalance } from "../../models";
import * as yup from "yup";
import { v4 as uuid } from "uuid";
import Pin from "../../middleware/check-pin";
import { Op } from "sequelize";
import sendPush from "../../middleware/send-push";
import sendMail from "../../middleware/mailer";
import { transferReceivedEmail } from "../../middleware/email-templates";
import { ADMIN_EMAIL, APP_NAME } from "../../config/constants";

var router = express.Router();
const moment = require("moment");

router.post("/user/transactions", async (req: Request, res: Response) => {
  const transactionSchema = defineInputSchema();

  try {
    const { body } = req;
    var wallet: Wallet | null;
    var bank: Bank | null;
    var newTransaction: Transaction | undefined;
    var reference = uuid();

    var field = await validateInput(body);

    var user = await User.findByPk(res.locals.user_id);

    await checkPinOrReturnIncorrectPin();

    checkIfUserCanTransferOrReturnResponse();

    if (field.paymentMethod == "crypto") {
      if (field.sendFrom == "crypto_wallet") {
        var walletBalance = await getWalletBalance();
        if (field.amount > walletBalance?.balance!) {
          return returnInsufficientBalance();
        }
      } else {
        if (field.amount > user?.accountBalance!) {
          return returnInsufficientBalance();
        }
      }
    }

    if (field.paymentMethod == "crypto") {
      wallet = await Wallet.findByPk(field.walletId);
      await createNewCryptoTransaction();

      if (field.sendFrom == "crypto_wallet") {
        await decrementSenderWalletBalance();
      } else {
        await incrementUserAccountBalance();
      }
    } else {
      bank = await Bank.findByPk(field.bankId);

      await createNewBankTransaction();

      await decrementSendingAccountBalance();

      if (field.paymentMethod == `inter_transfer`) {
        await incrementReceiverAccountBalance();

        var beneficiary = await User.findByPk(field.beneficiaryId);
        var sender = await User.findByPk(res.locals.user_id);
        if (beneficiary?.pushId != null) {
          sendPushNotificationToReceiver(beneficiary);
        }
        if (beneficiary !== null) {
          sendEmailNotificationToReceiver(beneficiary);
        }
      }
    }

    // Return the newly created transaction as a response
    return res.status(200).json({
      status: true,
      message: "Transfer successful",
      metadata: {
        method: field.paymentMethod,
      },
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
            attributes: ["firstName", "lastName", "email", "profileImg", "id"],
          },
          {
            model: User,
            as: "beneficiary",
            required: false,
            attributes: ["firstName", "lastName", "email", "profileImg", "id"],
          },
        ],
      }),
    });
  } catch (e) {
    const error = e as yup.ValidationError;
    // Handle validation errors or other errors
    return res.status(400).json({ error: error.errors });
  }

  function returnInsufficientBalance() {
    return res
      .status(422)
      .json({ status: false, message: "Insufficient balance" });
  }

  function defineInputSchema() {
    return yup
      .object()
      .shape({
        amount: yup.number().required(),
        paymentMethod: yup
          .string()
          .required()
          .oneOf(["bank_transfer", "crypto", `inter_transfer`]),
        narration: yup.string(),
        reference: yup.string().uuid(),
        walletId: yup.number(),
        bankId: yup.number(),
        beneficiaryId: yup.number().optional(),
        walletNetwork: yup.string().optional(),
        beneficiaryName: yup.string(),
        sendFrom: yup
          .string()
          .required()
          .oneOf([`inter_wallet`, "crypto_wallet"]),
        pin: yup.string().required(),
      })
      .test(
        "either-wallet-or-bank",
        "Either wallet_id or bank_id is required",
        function (value) {
          const { walletId, bankId } = value || {};
          return (
            (walletId !== undefined && bankId === undefined) ||
            (walletId === undefined && bankId !== undefined)
          );
        }
      )
      .test(
        `beneficiaryId & beneficiaryName is a required field for ${APP_NAME} transfer`,
        "beneficiaryId or beneficiaryName is required for bank transfer",
        function (value) {
          const { beneficiaryId, paymentMethod, beneficiaryName } = value || {};
          return (
            (paymentMethod != "crypto" && beneficiaryId !== undefined) ||
            (paymentMethod == "crypto" && beneficiaryName !== undefined)
          );
        }
      );
  }

  async function validateInput(body: any) {
    return await transactionSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });
  }

  async function checkPinOrReturnIncorrectPin() {
    // Check if the PIN provided in the request is correct
    var pinCheck = await new Pin({
      pin: field.pin,
      userId: res.locals.user_id,
    }).validate();

    // If the PIN check fails, return an error response
    if (!pinCheck) {
      return res.status(422).json({ status: false, message: "Incorrect pin" });
    }
  }

  function checkIfUserCanTransferOrReturnResponse() {
    if (user?.canTransfer == false) {
      return res.status(422).json({
        status: false,
        message: "Something went wrong",
        sub_message:
          "You cannot make Bank Transaction, kindly contact admin for support on how to enable Bank Transfer on your account",
        showDialog: true,
      });
    }
  }

  async function getWalletBalance() {
    return await WalletBalance.findOne({
      where: {
        walletId: field.walletId,
      },
    });
  }

  async function createNewCryptoTransaction() {
    newTransaction = await wallet?.createTransaction({
      amount: field.amount,
      paymentMethod: "crypto",
      narration: field.narration,
      status: "completed",
      userId: res.locals.user_id,
      beneficiaryName: field.beneficiaryName,
      reference: reference,
      walletNetwork: field.walletNetwork,
    });
  }

  async function decrementSenderWalletBalance() {
    await WalletBalance.decrement("balance", {
      by: field.amount,
      where: {
        walletId: field.walletId,
      },
    });
  }

  async function incrementUserAccountBalance() {
    await User.decrement("accountBalance", {
      by: field.amount,
      where: {
        id: res.locals.user_id,
      },
    });
  }

  async function createNewBankTransaction() {
    newTransaction = await bank?.createTransaction({
      amount: field.amount,
      paymentMethod: "bank_transfer",
      narration: field.narration,
      status: "completed",
      userId: res.locals.user_id,
      beneficiaryId: field.beneficiaryId,
      beneficiaryName: field.beneficiaryName,
      reference: reference,
    });
  }

  async function decrementSendingAccountBalance() {
    await User.decrement("accountBalance", {
      by: field.amount,
      where: {
        id: res.locals.user_id,
      },
    });
  }

  async function incrementReceiverAccountBalance() {
    await User.increment("accountBalance", {
      by: field.amount,
      where: {
        id: field.beneficiaryId,
      },
    });
  }

  function sendPushNotificationToReceiver(beneficiary: User) {
    // sendPush({
    //   heading: "Transfer Received Successful",
    //   content:
    //     "Your account has been credited with $${field.amount}. Your updated balance is now available. Tap to view details.",
    //   subscription_ids: [beneficiary?.pushId!],
    // });
  }

  function sendEmailNotificationToReceiver(beneficiary: User) {
    const currentDate = moment();
    const formattedDate = currentDate.format("YYYY-MM-DD HH:mmA");

    sendMail({
      to: beneficiary.email!,
      subject: "Transfer Received - Confirmation",
      html: transferReceivedEmail({
        name: beneficiary.firstName,
        new_balance: `$${beneficiary.accountBalance}`,
        sender_name: `${sender?.firstName} ${sender?.lastName}`,
        sender_account: `${sender?.id} (${APP_NAME})`,
        reference: reference,
        date: formattedDate,
        amount: `$${field.amount}`,
      }),
      res: res,
    });
  }
});

// Define a new route to fetch all transactions for a specific user_id
router.post("/user/transfer", async (req: Request, res: Response) => {
  const { body } = req;
  var wallet;
  var bank;
  var newTransaction;
  var reference = uuid();

  const transferSchema = yup.object().shape({
    amount: yup.number().required(),
    paymentMethod: yup.string().required().oneOf(["inter_transfer"]),
    walletId: yup.number().required(),
    sendFrom: yup.string().required().oneOf([`inter_wallet`, "crypto_wallet"]),
    pin: yup.string().required(),
  });

  try {
    // Validate the request body against the schema
    try {
      var field = await transferSchema.validate(body, {
        abortEarly: false,
        stripUnknown: true,
      });
    } catch (e) {
      const error = e as yup.ValidationError;
      return res.status(422).json({ errors: error.errors });
    }

    // Check if the PIN provided in the request is correct
    var pinCheck = await new Pin({
      pin: field.pin,
      userId: res.locals.user_id,
    }).validate();

    // If the PIN check fails, return an error response
    if (!pinCheck) {
      return res.status(422).json({ status: false, message: "Incorrect pin" });
    }

    // If it's a crypto transaction, check the wallet balance
    if (field.sendFrom == "crypto_wallet") {
      var walletBalance = await WalletBalance.findOne({
        where: {
          walletId: field.walletId,
        },
      });

      // If the wallet balance is insufficient, return an error response
      if (field.amount > walletBalance?.balance!) {
        return res
          .status(422)
          .json({ status: false, message: "Insufficient balance" });
      }
    } else {
      // If the payment method is not 'crypto,' check the user's account balance
      var user = await User.findByPk(res.locals.user_id);

      // If the user's account balance is insufficient, return an error response
      if (field.amount > user?.accountBalance!) {
        return res
          .status(422)
          .json({ status: false, message: "Insufficient balance" });
      }
    }

    var user = await User.findByPk(res.locals.user_id);

    if (field.sendFrom == "crypto_wallet") {
      // Decrement the wallet balance
      await WalletBalance.decrement("balance", {
        by: field.amount,
        where: {
          walletId: field.walletId,
        },
      });

      // Increase the user's account balance
      await User.increment("accountBalance", {
        by: field.amount,
        where: {
          id: res.locals.user_id,
        },
      });

      // If it's a crypto transaction, create a new transaction in the wallet
      wallet = await Wallet.findByPk(field.walletId);
      newTransaction = await wallet?.createTransaction({
        amount: field.amount,
        paymentMethod: "inter_transfer",
        narration: `Transfer to your ${APP_NAME} Wallet`,
        status: "completed",
        userId: res.locals.user_id,
        beneficiaryName: "Crypto Wallet",
        reference: reference,
        walletNetwork: "",
      });

      await user?.createTransaction({
        amount: field.amount,
        paymentMethod: "inter_transfer",
        narration: "Transfer from your " + wallet?.name + " Wallet",
        status: "completed",
        userId: res.locals.user_id,
        beneficiaryId: res.locals.user_id,
        beneficiaryName: "Crypto Wallet",
        reference: reference,
        walletNetwork: "",
      });
    } else {
      // Increase the wallet balance
      await WalletBalance.increment("balance", {
        by: field.amount,
        where: {
          walletId: field.walletId,
        },
      });

      // Decrease the user's account balance
      await User.decrement("accountBalance", {
        by: field.amount,
        where: {
          id: res.locals.user_id,
        },
      });

      // If it's a crypto transaction, create a new transaction in the wallet
      wallet = await Wallet.findByPk(field.walletId);
      newTransaction = await wallet?.createTransaction({
        amount: field.amount,
        paymentMethod: "inter_transfer",
        narration: `Transfer from your ${APP_NAME} Wallet`,
        status: "completed",
        beneficiaryId: res.locals.user_id,
        reference: reference,
        walletNetwork: "",
      });

      newTransaction = await user?.createTransaction({
        amount: field.amount,
        paymentMethod: "bank_transfer",
        narration: "Transfer to your " + wallet?.name + " Wallet",
        status: "completed",
        userId: res.locals.user_id,
        // beneficiaryId: res.locals.user_id,
        beneficiaryName: "Crypto Wallet",
        reference: reference,
      });
    }

    // Return the list of transactions
    return res.status(200).json({
      status: true,
      metadata: {
        method: field.paymentMethod,
      },
      transaction: newTransaction,
      message: "Transfer successful",
    });
  } catch (error) {
    // Handle errors appropriately, e.g., log them or send an error response
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Export the router for use in your Express application
module.exports = router;

// Define a new route to fetch all transactions for a specific user_id
router.get("/user/transactions", async (req: Request, res: Response) => {
  try {
    // Fetch all transactions associated with the provided user_id
    const transactions = await Transaction.findAll({
      where: {
        walletId: null,

        [Op.or]: {
          userId: res.locals.user_id,
          beneficiaryId: res.locals.user_id,
        },
      },
      order: [["id", "DESC"]],
    });

    // Return the list of transactions
    return res.status(200).json(transactions);
  } catch (error) {
    // Handle errors appropriately, e.g., log them or send an error response
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Export the router for use in your Express application
module.exports = router;
