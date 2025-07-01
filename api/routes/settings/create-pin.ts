import { ValidationError, object, string } from "yup";
import { User } from "../../models";

import express, { Request, Response } from "express";
import Password from "../../middleware/password";

var router = express.Router();

router.post('/user/create-pin', async function (req: any, res: any) {

    var field;
    let validator = object({
        pin: string().required().min(4).max(4),
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

    // Hash new pin
    const hash_pin = await new Password({ password: field.pin }).encrypt();

    // Update password
    await User.update({
        pin: hash_pin!,
    }, {
        where: {
            id: res.locals.user_id
        }
    })
    return res.json({ status: true, message: 'Pin created successfully' });
});

router.post('/user/check-pin', async function (req: any, res: any) {

    var field;
    let validator = object({
        pin: string().required(),
    });

    try {
        field = validator.validateSync(req.body, { abortEarly: false, stripUnknown: true });
    } catch (e) {
        const error = e as ValidationError;
        return res.status(422).json({ errors: error.errors, message: 'Pin is a required field and must be at least 4 characters' });
    }

    // Fetch current user
    const user = await User.findOne({
        where: {
            id: res.locals.user_id
        }
    });

    if (user?.pin == null) {
        return res.status(422).json({ status: false, message: 'You have not created pin yet' });
    }

    // CHECK IF PIN MATCH
    const validatePassword = await new Password({ password: field.pin, hash: `${user!.pin}` }).validate();
    if (!validatePassword) {
        return res.status(422).json({ status: false, message: 'Incorrect pin' });
    } else {
        return res.json({ status: true, message: 'Pin validated' });
    }
});

module.exports = router;
