import { ValidationError, object, string } from "yup";
import { User, VerificationToken } from "../../models";

import express, { Request, Response } from "express";
import Password from "../../middleware/password";

var router = express.Router();

router.post('/user/change-password', async function (req: any, res: any) {

    var field;
    let validator = object({
        current_password: string().required(),
        new_password: string().required().min(6),
    });

    try {
        field = validator.validateSync(req.body, { abortEarly: false, stripUnknown: true });
    } catch (e) {
        const error = e as ValidationError;
        return res.status(422).json({ errors: error.errors });
    }

    // Fetch current user
    const user = await User.findOne({
        where: {
            id: res.locals.user_id
        }
    });

    // CHECK IF EMAIL AND PASSWORD MATCH
    const validatePassword = await new Password({ password: field.current_password, hash: user!.password }).validate();
    if (!validatePassword) {
        return res.status(422).json({ status: false, message: 'Incorrect password', statusCode: 'IncorrectPassword' });
    }

    // Hash new password
    const hash_password = await new Password({ password: field.new_password }).encrypt();

    // Update password
    await User.update({
        password: hash_password!,
    }, {
        where: {
            id: res.locals.user_id
        }
    })
    return res.json({ status: true, message: 'Password change successfully' });
});

router.post('/reset-password', async function (req: any, res: any) {
    var field;
    let validator = object({
        token: string().required(),
        email: string().required(),
        new_password: string().required().min(6),
    });

    try {
        field = validator.validateSync(req.body, { abortEarly: false, stripUnknown: true });
    } catch (e) {
        const error = e as ValidationError;
        return res.status(422).json({ errors: error.errors });
    }

    // Fetch current user
    const user = await User.findOne({
        where: {
            email: field.email
        }
    });

    if (user == null) {
        return res.status(400).json({ message: 'User not found' });
    }

    // Find the verification token in the database
    const verificationToken = await VerificationToken.findOne({
        where: {
            userId: user?.id,
            token: field.token,
            expiresAt: { [Symbol.for('gt')]: new Date() }, // Check token expiration
        },
    });


    if (!verificationToken) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Delete the used verification token
    await verificationToken.destroy();


    // Hash new password
    const hash_password = await new Password({ password: field.new_password }).encrypt();

    // Update password
    await User.update({
        password: hash_password!,
    }, {
        where: {
            email: field.email
        }
    })
    return res.json({ status: true, message: 'Password change successfully' });
});

router.post('/user/check-password', async function (req: any, res: any) {

    var field;
    let validator = object({
        password: string().required(),
    });

    try {
        field = validator.validateSync(req.body, { abortEarly: false, stripUnknown: true });
    } catch (e) {
        const error = e as ValidationError;
        return res.status(422).json({ errors: error.errors });
    }

    // Fetch current user
    const user = await User.findOne({
        where: {
            id: res.locals.user_id
        }
    });

    // CHECK IF EMAIL AND PASSWORD MATCH
    const validatePassword = await new Password({ password: field.password, hash: user!.password }).validate();
    if (!validatePassword) {
        return res.status(422).json({ status: false, message: 'Incorrect password' });
    } else {
        return res.json({ status: true, message: 'Password validated' });
    }
});


module.exports = router;
