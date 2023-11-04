import express, { Request, Response } from "express";
import { ValidationError } from "sequelize";
import { object, string } from "yup";
import { generateAccessToken } from "../../middleware/JWT";
import { User, Wallet } from "../../models";
import Password from "../../middleware/password";
import { registrationEmail } from "../../middleware/email-templates";
import sendMail from "../../middleware/mailer";

var router = express.Router();

/* Register . */
router.post("/auth/register", async function (req: Request, res: Response) {
    var field;
    let validator = object({
        firstName: string().required(),
        lastName: string().required(),
        email: string().email().required(),
        password: string().min(6).required(),
        state: string().required(),
        country: string().required(),
        address: string().required(),
        dateOfBirth: string().required(),
        phone: string().required(),
        gender: string()
            .oneOf(['male', 'female'] as const)
            .defined()
    });

    try {
        field = validator.validateSync(req.body, { abortEarly: false, stripUnknown: true });
    } catch (e) {
        const error = e as ValidationError;
        console.log(error.errors, field?.gender);
        return res.status(422).json({ errors: error.errors });
    }

    // CHECK IF EMAIL EXIST
    if (await User.findOne({
        where: {
            email: field.email,
        }
    }) != null) {
        return res.status(404).json({
            status: false,
            statusCode: 'AlreadyExist',
            message: 'User with email address already exist'
        });
    }

    const hash_password = await new Password({ password: field.password }).encrypt();

    try {
        var data = await User.create({
            firstName: field.firstName,
            lastName: field.lastName,
            email: field.email,
            password: hash_password!,
            gender: field.gender,
            state: field.state,
            country: field.country,
            address: field.address,
            dateOfBirth: field.dateOfBirth,
            phone: field.phone,
            emailVerified: false,
            accountLevel: 'tier1'

        });
        var token = await generateAccessToken({ email: req.body['email'], user_id: data.id, date: Date.now() });
        const user = await User.findOne({
            where: { email: field.email, }, attributes: {
                exclude: ['password']
            }
        });

        var wallet = await Wallet.findAll();
        wallet.forEach(async e => {
            await e.createWalletBalance({ balance: 0, userId: data.id });
            console.log('Creating wallet balance for ' + e.name);
        });

        var mail = sendMail({
            to: field.email, subject: 'Registration Successful', html: registrationEmail(field.firstName), res: res
        });

        return res.json({
            message: 'Registration successful', user,
            token: token,
        });
    } catch (e) {
        const error = e as ValidationError;
        console.log(error.errors);
        return res.status(422).json({ errors: error.errors });
    }
});

module.exports = router;
