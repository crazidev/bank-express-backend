import express, { Router, Request, Response } from 'express';
import * as yup from 'yup';
import { ValidationError, where } from 'sequelize';
import { User } from '../../models';

var router = express.Router();

router.post('/admin/updateBalance', async (req: Request, res: Response) => {
    try {
        var field;
        let validator = yup.object({
            email: yup.string().email().required(),
            balance: yup.number()
        });

        try {
            field = validator.validateSync(req.body, { abortEarly: false, stripUnknown: true });
        } catch (e) {
            const error = e as ValidationError;
            return res.status(422).json({ errors: error.errors });
        }

        await User.update({
            accountBalance: field.balance,
        }, {
            where: {
                email: field.email
            }
        });

        return res.status(200).json({
            status: true,
            message: 'Balance updated successfully'
        });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = router;
