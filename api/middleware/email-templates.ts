import { APP_NAME } from "../config/constants";

export const verificationEmail = (token: string) => EmailTemplate('Email Verification', `
    <p>
      Thank you for using our app! To complete the verification process, please use the following token:
    <br/>
      <center><h1>${token}</h1></center>
    <br/>
    <div style="font-size:12px; color: rgb(60, 60, 60);">
      You can enter this token in the app to confirm your identity and continue using our services securely.
      If you didn't request this token or need any assistance, please contact our support team at support@${APP_NAME}.us.
    </div>
    </p>
`);

export const loginEmail = () => EmailTemplate('Login Successful', `
    <p>Your login to your ${APP_NAME} account was successful.</p>
    <p>If you have any questions or need assistance, please don't hesitate to contact our customer support team.</p>
    <p>Thank you for choosing ${APP_NAME} as your financial partner.</p>
`);

export const registrationEmail = (name: string) => EmailTemplate('Registration Successful', `
    <p>Dear ${name},</p>
    <p>We are thrilled to welcome you to ${APP_NAME}, your trusted destination for secure cryptocurrency banking and financial services. Your registration has been successfully completed, and you are now a valued member of our community.</p>
    <h2>What's Next:</h2>
    <ul style="list-style: none; padding: 0;">
      <li style="color: #007BFF !important; margin-right: 10px;">✓ Secure cryptocurrency storage and management.</li>
      <li style="color: #007BFF !important; margin-right: 10px;">✓ Quick and easy cryptocurrency-to-fiat exchange.</li>
      <li style="color: #007BFF !important; margin-right: 10px;">✓ Seamless bank transfers.</li>
      <li style="color: #007BFF !important; margin-right: 10px;">✓ Round-the-clock customer support.</li>
    </ul>
    <p>Should you have any questions or need assistance with your account, our support team is here to help. Reach out to us at <a href="mailto:support@${APP_NAME}.com">support@${APP_NAME}.com</a>.</p>
    <p>Thank you for choosing ${APP_NAME}. We look forward to assisting you on your cryptocurrency journey!</p>
`);

export const emailVerifiedEmail = () => EmailTemplate('Email Verification Successful', `
    <p>Congratulations! Your email has been successfully verified for your ${APP_NAME} account.</p>
    <p>You're all set to enjoy our services. If you need assistance, feel free to contact us.</p>
    <p>Thank you for choosing ${APP_NAME}!</p>
`);

export const adminRegistrationEmail = () => EmailTemplate('Email Verification Successful', `
    <p>Congratulations! Your email has been successfully verified for your ${APP_NAME} account.</p>
    <p>You're all set to enjoy our services. If you need assistance, feel free to contact us.</p>
    <p>Thank you for choosing ${APP_NAME}!</p>
`);

type transferReceivedEmailProps = {
  sender_name: string,
  sender_account: string,
  date: any,
  reference: string,
  new_balance: string,
  amount: string,
  name: string,
}

export const transferReceivedEmail = (details: transferReceivedEmailProps) => EmailTemplate('Transfer Received Successful', `
    <p>You've received a successful transfer of ${details.amount}. Check your account balance now.</p>
    <h4>Transfer Details:</h4>
    <ul style="list-style: none; padding: 0;">
      <li style="margin-right: 10px; margin-bottom: 5px;">Sender's Name: ${details.sender_name}</li>
      <li style="margin-right: 10px; margin-bottom: 5px;">Sender's Account: ${details.sender_account}</li>
      <li style="margin-right: 10px; margin-bottom: 5px;">Date: ${details.date}</li>
      <li style="margin-right: 10px; margin-bottom: 5px;">Reference Number: ${details.reference}</li>
    </ul>

    <p>Your updated account balance is now ${details.new_balance}. You can log in to your account to view the transaction details and your updated balance.</p>

    <p>Should you have any questions or need assistance with your account, our support team is here to help. Reach out to us at <a href="mailto:support@${APP_NAME}.us">support@${APP_NAME}.us</a>.</p>

    <p>Thank you for choosing ${APP_NAME}. We look forward to assisting you on your cryptocurrency journey!</p>
`);

export const EmailTemplate = (title: string, body: string) => `
    <html>
      <body style="font-family: Arial, Helvetica, sans-serif;">
        <center><img src="https://${APP_NAME?.toLocaleLowerCase()}.us/api/public/image/logo_large.png" width="180" style="margin-bottom: 20px; margin-top: 10px;"/></center>
        <div class="container" style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; box-shadow: 0px 2px 9px 5px rgba(162, 0, 255, 0.2); max-width: 800px;margin: 0 auto;">
        <center><h1 style="color: #333;">${title}</h1></center>
        <p style="color: #555  !important;">${body}</p>
      </div>
      </body>
    </html>
`;
