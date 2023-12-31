import express, { Router, Request, Response } from 'express';
import * as yup from 'yup';
import { ValidationError } from 'sequelize';
import { User } from '../../models';

var router = express.Router();

router.post('/admin/checkBalance', async (req: Request, res: Response) => {
    try {

        var field;
        let validator = yup.object({
            email: yup.string().email().required(),
        });

        try {
            field = validator.validateSync(req.body, { abortEarly: false, stripUnknown: true });
        } catch (e) {
            const error = e as ValidationError;
            return res.status(422).json({ errors: error.errors });
        }

        const user = await User.findByPk(res.locals.user_id);

        return res.status(200).json(user?.accountBalance);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = router;
