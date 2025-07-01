import express, { Router, Request, Response } from 'express';
import * as yup from 'yup';
import { ValidationError } from 'sequelize';
import { User } from '../../models';

var router = express.Router();
// Define a route to find a beneficiary by account number and return their name and picture
router.get('/user/find-beneficiary/:email', async (req: Request, res: Response) => {
    try {
        const { email } = req.params;

        if (email == res.locals.email) {
            return res.status(404).json({ error: 'You cannot transfer to yourself' });
        }

        // Use Sequelize to query the User model to find the beneficiary by account number
        const beneficiary = await User.findOne({
            where: { email: email ?? '' }, // Adjust the condition based on your database structure
            attributes: ['firstName', 'lastName', 'email', 'profileImg', 'id'], // Return only firstName and profileImg
        });

        if (!beneficiary) {
            return res.status(404).json({ error: 'Beneficiary not found' });
        }

        // Return the name and picture of the beneficiary
        return res.status(200).json(beneficiary);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = router;
