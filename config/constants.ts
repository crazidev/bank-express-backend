require('dotenv').config();

export const HOST_URL = process.env.API_ENDPOINT;
export const UPDATE_URL = process.env.UPDATE_URL;

export const APP_NAME = process.env.APP_NAME;

export const EMAIL_FROM = process.env.EMAIL_FROM;
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export const SMPT_HOST = process.env.MAIL_SERVER;
export const SMPT_USERNAME = process.env.MAIL_USERNAME;
export const SMPT_PASSWORD = process.env.MAIL_PASSWORD;
export const SMPT_POST = parseInt(process.env.MAIL_PORT ?? '465');

export const ONESIGNAL_TOKEN = process.env.ONESIGNAL_TOKEN;
export const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;

export const APPLE_KEY_ID = process.env.APPLE_KEY_ID;
export const APPLE_ISSUE_ID = process.env.APPLE_ISSUE_ID;

