import express, { Request, Response, Router } from 'express';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { User, VerificationToken } from '../../models'; // Import your Sequelize models
import * as yup from 'yup';
import { ValidationError } from 'sequelize';
import sendMail from '../../middleware/mailer';
import { emailVerifiedEmail, verificationEmail } from '../../middleware/email-templates';

const router = express();

// Define a Yup schema for request validation
const sendTokenSchema = yup.object().shape({
    email: yup.string().email().required(),
    resetEmail: yup.boolean().optional(),
});


// Endpoint to send an email verification token
router.post('/send-verification-token', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        // Validate the request data using Yup schema
        const field = await sendTokenSchema.validate({ email });

        // Check if the user with the provided email exists in the database
        const user = await User.findOne({ where: { email: field.email } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate a random 6-digit verification token
        const verificationToken = crypto.randomInt(100000, 999999).toString();

        // Create a new VerificationToken record in the database
        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() + 30); // Token expiration: 30 minutes

        await VerificationToken.create({
            userId: user.id,
            token: verificationToken,
            expiresAt: expirationDate,
        });

        var mail = await sendMail({
            to: field.email, subject: 'Email Verification Token', html: verificationEmail(verificationToken), res: res
        });

        console.log(verificationToken)


        res.json({ status: true, message: 'Verification token sent successfully', expiresAt: expirationDate });
    } catch (e) {
        const error = e as ValidationError;
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: error.errors });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});


const verifyTokenSchema = yup.object({
    email: yup.string().email().required(),
    token: yup.string().length(6).matches(/^\d+$/).required(),
    resetEmail: yup.boolean().optional(),
});
// Endpoint to verify the email verification token
router.post('/verify-token', async (req: Request, res: Response) => {
    try {

        // Validate the request data using Yup schema
        let field = verifyTokenSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

        var resetEmail = field.resetEmail == undefined ? false : true;

        // Find the user by email
        const user = await User.findOne({ where: { email: field.email } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find the verification token in the database
        const verificationToken = await VerificationToken.findOne({
            where: {
                userId: user.id,
                token: field.token,
                expiresAt: { [Symbol.for('gt')]: new Date() }, // Check token expiration
            },
        });

        // console.log(verificationToken?.expiresAt, new Date());

        if (!verificationToken) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Mark the user as verified (update your User model as needed)
        user.emailVerified = true;
        await user.save();

        var mail = sendMail({
            to: field.email, subject: 'Email verified successfully', html: emailVerifiedEmail(), res: res
        });

        res.json({ message: 'Email verified successfully' });
    } catch (e) {
        const error = e as ValidationError;
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: error.errors });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

module.exports = router;