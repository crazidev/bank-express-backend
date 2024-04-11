// Import the express in typescript file
import express, { json } from "express";
import { initModels } from "./models";
import db from "./database";
import morgan from "morgan";
import cors from "cors";
require("dotenv").config();
const app: express.Application = express();

var port = process.env.PORT;
import BodyParser from "body-parser";
import getCurrentVersion from "./routes/version-checker";

// Handle preflight requests (OPTIONS)
app.options("*", cors()); // Allow preflight requests for all routes

app.use(cors());

// Middlewares
app.use(morgan("common"));
app.use(express.urlencoded({ extended: false }));
app.use(json());
app.use(BodyParser.urlencoded());

const index = require("./routes/index");
const login = require("./routes/auth/login");
const register = require("./routes/auth/register");
const user_details = require("./routes/user/details");
const kyc_verification = require("./routes/user/kyc-verification");
const send_otp = require("./routes/auth/send-email-otp");
const email_verification = require("./routes/auth/email-verification");
const verify_otp = require("./routes/auth/verify-email");
const password = require("./routes/settings/change-password");
const pin = require("./routes/settings/create-pin");
const wallet = require("./routes/user/wallet");
const transactions = require("./routes/user/transaction");
const findBeneficiary = require("./routes/user/find-beneficiary");
const livechat = require("./routes/user/livechat");
const updatePushID = require("./routes/user/update-token");

app.get("/sync-db", async (req, res) => {
  console.log("Syncing db");
  await db.sync({});

  res.send("Done");
});

app.use("/", (req, res, next) => {
  initModels(db);
  next();
});

app.use("/public", express.static("public"));
app.use(index);
app.use(login);
app.use(register);
app.use(user_details);
app.use(kyc_verification);
app.use(send_otp);
app.use(verify_otp);
app.use(email_verification);
app.use(password);
app.use(pin);
app.use(wallet);
app.use(transactions);
app.use(findBeneficiary);
app.use(livechat);
app.use(updatePushID);
app.use("/version", getCurrentVersion);

// Admin
app.use(require("./routes/admin/auth/login"));

app.use(require("./routes/admin/user/get-all-users"));
app.use(require("./routes/admin/user/change-account-tier"));
app.use(require("./routes/admin/user/change-user-password"));
app.use(require("./routes/admin/user/change-user-profile-pic"));
app.use(require("./routes/admin/user/delete-user"));
app.use(require("./routes/admin/user/update-kyc-status"));
app.use(require("./routes/admin/user/update-balance"));

app.use(require("./routes/admin/livehchat/get-all-livechat"));
app.use(require("./routes/admin/livehchat/send-message"));

app.use(require("./routes/admin/transaction/delete-transaction"));
app.use(require("./routes/admin/transaction/get-user-transactions"));
app.use(require("./routes/admin/transaction/update-transaction"));
app.use(require("./routes/admin/transaction/create-transaction"));

const server = app.listen(port, async () => {
  try {
    await db.authenticate();

    console.log("Connection has been established successfully.");
  } catch (error) {
    // server.close();
    console.error("Unable to connect to the database:", error);
  }

  console.log(`TypeScript with Express http://localhost:${port}/`);
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
