import { number, object, string } from "yup";
import { User } from "../../models";

import express, { Request, Response } from "express";
import { ValidationError } from "sequelize";

var router = express.Router();

router.post('/user/verify-otp', async function (req: any, res: Response) {
    var field;
    let validator = object({
        token: number().required().min(6),
    });


    try {
        field = validator.validateSync(req.body, { abortEarly: false, stripUnknown: true });
    } catch (e) {
        const error = e as ValidationError;
        return res.status(422).json({ errors: error.errors });
    }

    const user = await User.findOne({
        where: {
            emailToken: field.token
        }
    });

    if (user == null) {
        return res.status(422).json({ status: false, message: 'Verification token is invalid' });
    } else {
        user.emailVerified = true;
        await user.save();
        return res.status(200).json({ status: true, message: 'Your email has been successfully verified' });
    }

});

module.exports = router;
