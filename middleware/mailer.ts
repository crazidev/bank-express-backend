import { Request, RequestHandler, Response } from "express";
import nodemailer, { Transporter } from "nodemailer";
import { Address, AttachmentLike } from "nodemailer/lib/mailer";
import { Readable } from "nodemailer/lib/xoauth2";
import { exit } from "process";
import { EmailTemplate } from "./email-templates";
import {
  APP_NAME,
  EMAIL_FROM,
  SMPT_HOST,
  SMPT_PASSWORD,
  SMPT_POST,
  SMPT_USERNAME,
} from "../config/constants";

const transporter: Transporter = nodemailer.createTransport({
  host: SMPT_HOST ?? "",
  port: SMPT_POST,
  secure: true,
  debug: true,
  auth: {
    user: SMPT_USERNAME,
    pass: SMPT_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

type EmailProps = {
  from?: string | Address;
  to: string | Address;
  html?: string | Readable | Buffer | AttachmentLike;
  text?: string | Buffer | Readable | AttachmentLike;
  subject: string;
  res?: Response;
};

export default async function sendMail(props: EmailProps) {
  try {
    transporter.verify(function (error, success) {
      if (error) {
        // props.res?.status(500).json({ message: 'Couldn\'t connect to mail server', error: error.message });
      } else {
        console.log("server ready to take our email messages");
      }
    });
  } catch (error) {
    var e = error as Error;
    console.log(e.message);
  }

  try {
    await transporter.sendMail({
      from: props.from ?? `${APP_NAME} ${EMAIL_FROM}`,
      to: props.to,
      subject: props.subject,
      text: props.text,
      html: props.html,
    });
  } catch (e) {
    console.log(e);
    // props.res?.status(500).json({ status: false, error: e });
  }

  return true;
}
