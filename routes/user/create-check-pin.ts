import express, { Router, Request, Response } from 'express';
import * as yup from 'yup';
import { ValidationError } from 'sequelize';
import { User } from '../../models';

var router = express.Router();
// Define a route to find a beneficiary by account number and return their name and picture
router.post('/user/create-pin', async (req: Request, res: Response) => {
    try {

        var field;
        let validator = yup.object({
            pin: yup.string().max(4).min(4).required(),
            reset: yup.bool().required(),
        });

        try {
            field = validator.validateSync(req.body, { abortEarly: false, stripUnknown: true });
        } catch (e) {
            const error = e as ValidationError;
            return res.status(422).json({ errors: error.errors });
        }

        // Use Sequelize to query the User model to find the beneficiary by account number
        const user = await User.findByPk(res.locals.user_id);


        // Return the name and picture of the beneficiary
        // return res.status(200).json(beneficiary);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = router;
