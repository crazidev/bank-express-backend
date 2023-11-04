import { ValidationError, object, string } from "yup";
import { User } from "../../models";

import express, { Request, Response } from "express";

var router = express.Router();

router.post('/user/update-push-id', async (req: Request, res: Response) => {

    var field;
    let validator = object({
        token: string().required(),
    });

    try {
        field = validator.validateSync(req.body, { abortEarly: false, stripUnknown: true });
    } catch (e) {
        const error = e as ValidationError;
        return res.status(422).json({ errors: error.errors });
    }

    // Update password
    await User.update({
        pushId: field.token,
    }, {
        where: {
            id: res.locals.user_id
        }
    })
    return res.json({ status: true, message: 'Token updated' });
});

module.exports = router;
