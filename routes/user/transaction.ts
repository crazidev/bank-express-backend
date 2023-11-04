// Import required modules and models
import express, { Router, Request, Response } from 'express';
import { Bank, Transaction, User, Wallet, WalletBalance } from '../../models';
import * as yup from 'yup';
import { v4 as uuid } from 'uuid';
import Pin from '../../middleware/check-pin';
import { Op } from 'sequelize';
import sendPush from '../../middleware/send-push';
import sendMail from '../../middleware/mailer';
import { transferReceivedEmail } from '../../middleware/email-templates';
import { ADMIN_EMAIL, APP_NAME } from '../../config/constants';

// Create an Express Router
var router = express.Router();
const moment = require('moment');

// Define a route for creating a new transaction
router.post('/user/transactions', async (req: Request, res: Response) => {

    // Create a schema for validating the request body
    const transactionSchema = yup.object().shape({
        amount: yup.number().required(),
        paymentMethod: yup.string().required().oneOf(['bank_transfer', 'crypto', `${APP_NAME?.toLocaleLowerCase()}_transfer`]),
        narration: yup.string(),
        reference: yup.string().uuid(),
        walletId: yup.number(),
        bankId: yup.number(),
        beneficiaryId: yup.number().optional(),
        walletNetwork: yup.string().optional(),
        beneficiaryName: yup.string(),
        sendFrom: yup.string().required().oneOf([`${APP_NAME?.toLocaleLowerCase()}_wallet`, 'crypto_wallet']),
        pin: yup.string().required()
    }).test('either-wallet-or-bank', 'Either wallet_id or bank_id is required', function (value) {
        const { walletId, bankId } = value || {};
        return (walletId !== undefined && bankId === undefined) || (walletId === undefined && bankId !== undefined);
    }).test(`beneficiaryId & beneficiaryName is a required field for ${APP_NAME} transfer`, 'beneficiaryId or beneficiaryName is required for bank transfer', function (value) {
        const { beneficiaryId, paymentMethod, beneficiaryName } = value || {};
        return (paymentMethod != 'crypto' && beneficiaryId !== undefined || paymentMethod == 'crypto' && beneficiaryName !== undefined)
    });

    try {
        const { body } = req;

        // Validate the request body against the schema
        var field = await transactionSchema.validate(body, { abortEarly: false, stripUnknown: true });
        var wallet;
        var bank;
        var newTransaction;
        var reference = uuid();

        // Check if the PIN provided in the request is correct
        var pinCheck = await new Pin({
            pin: field.pin, userId: res.locals.user_id
        }).validate();

        // If the PIN check fails, return an error response
        if (!pinCheck) {
            return res.status(422).json({ status: false, message: 'Incorrect pin' });
        }


        // disallow users from sending and only allow admin to send
        if (res.locals.email != ADMIN_EMAIL) {
            // If the user's account balance is insufficient, return an error response
            return res.status(422).json({ status: false, message: 'Something went wrong', sub_message: 'You cannot make Bank Transaction, kindly contact admin for support on how to enable Bank Transfer on your account', showDialog: true });
        }

        // Check the payment method to determine how to handle the transaction
        if (field.paymentMethod == 'crypto') {
            // If it's a crypto transaction, check the wallet balance
            if (field.sendFrom == 'crypto_wallet') {
                var walletBalance = await WalletBalance.findOne({
                    where: {
                        walletId: field.walletId
                    }
                });

                // If the wallet balance is insufficient, return an error response
                if (field.amount > walletBalance?.balance!) {
                    return res.status(422).json({ status: false, message: 'Insufficient balance' });
                }
            } else {
                // If the payment method is not 'crypto,' check the user's account balance
                var user = await User.findByPk(res.locals.user_id);

                // If the user's account balance is insufficient, return an error response
                if (field.amount > user?.accountBalance!) {
                    return res.status(422).json({ status: false, message: 'Insufficient balance' });
                }
            }
        }

        // Handle the transaction based on the payment method
        if (field.paymentMethod == 'crypto') {
            // If it's a crypto transaction, create a new transaction in the wallet
            wallet = await Wallet.findByPk(field.walletId);
            newTransaction = await wallet?.createTransaction({
                amount: field.amount,
                paymentMethod: 'crypto',
                narration: field.narration,
                status: 'completed',
                userId: res.locals.user_id,
                beneficiaryName: field.beneficiaryName,
                reference: reference,
                walletNetwork: field.walletNetwork
            });


            if (field.sendFrom == 'crypto_wallet') {
                // Decrement the wallet balance
                await WalletBalance.decrement('balance', {
                    by: field.amount,
                    where: {
                        walletId: field.walletId
                    }
                });
            } else {
                // Update the user's account balance
                await User.decrement('accountBalance', {
                    by: field.amount,
                    where: {
                        id: res.locals.user_id
                    }
                });
            }

        } else {
            // If it's not a crypto transaction, create a new transaction in the bank
            bank = await Bank.findByPk(field.bankId);
            newTransaction = await bank?.createTransaction({
                amount: field.amount,
                paymentMethod: 'bank_transfer',
                narration: field.narration,
                status: 'completed',
                userId: res.locals.user_id,
                beneficiaryId: field.beneficiaryId,
                beneficiaryName: field.beneficiaryName,
                reference: reference,
            });

            // Update the user's account balance
            await User.decrement('accountBalance', {
                by: field.amount,
                where: {
                    id: res.locals.user_id
                }
            });

            // If it's a 'app_wallet_name,' also update the beneficiary's account balance
            if (field.paymentMethod == `${APP_NAME?.toLocaleLowerCase()}_transfer`) {
                // Update the beneficiary's account balance
                await User.increment('accountBalance', {
                    by: field.amount,
                    where: {
                        id: field.beneficiaryId
                    }
                });

                var beneficiary = await User.findByPk(field.beneficiaryId);
                var sender = await User.findByPk(res.locals.user_id);
                if (beneficiary?.pushId != null) {
                    // sendPush({
                    //     heading: 'Transfer Received Successful',
                    //     content: 'Your account has been credited with $${field.amount}. Your updated balance is now available. Tap to view details.',
                    //     subscription_ids: [beneficiary?.pushId],
                    // });

                    const currentDate = moment();
                    const formattedDate = currentDate.format('YYYY-MM-DD HH:mmA');

                    sendMail({
                        to: beneficiary.email!, subject: 'Transfer Received - Confirmation', html: transferReceivedEmail({
                            name: beneficiary.firstName, new_balance: `$${beneficiary.accountBalance}`, sender_name:
                                `${sender?.firstName} ${sender?.lastName}`, sender_account: `${sender?.id} (${APP_NAME})`, reference: reference, date: formattedDate, amount: `$${field.amount}`
                        }), res: res
                    });
                }
            }
        }

        // Return the newly created transaction as a response
        return res.status(200).json({
            status: true, message: 'Transfer successful',
            metadata: {
                method: field.paymentMethod,
            },
            transaction: await Transaction.findByPk(newTransaction?.id, {
                include: [
                    {
                        model: Bank,
                        as: 'bank'
                    },
                    {
                        model: Wallet, as: 'wallet',
                    },
                    {
                        model: User,
                        as: 'user',
                        required: false,
                        attributes: ['firstName', 'lastName', 'email', 'profileImg', 'id']
                    },
                    {
                        model: User,
                        as: 'beneficiary',
                        required: false,
                        attributes: ['firstName', 'lastName', 'email', 'profileImg', 'id']
                    }
                ],
            })
        });
    } catch (e) {
        const error = e as yup.ValidationError;
        // Handle validation errors or other errors
        return res.status(400).json({ error: error.errors });
    }
});

// Define a new route to fetch all transactions for a specific user_id
router.post('/user/transfer', async (req: Request, res: Response) => {
    const { body } = req;
    var wallet;
    var bank;
    var newTransaction;
    var reference = uuid();

    const transferSchema = yup.object().shape({
        amount: yup.number().required(),
        paymentMethod: yup.string().required().oneOf(['inter_transfer']),
        walletId: yup.number().required(),
        sendFrom: yup.string().required().oneOf([`${APP_NAME?.toLocaleLowerCase()}_wallet`, 'crypto_wallet']),
        pin: yup.string().required()
    });

    try {
        // Validate the request body against the schema
        try {
            var field = await transferSchema.validate(body, { abortEarly: false, stripUnknown: true });
        } catch (e) {
            const error = e as yup.ValidationError;
            return res.status(422).json({ errors: error.errors });
        }


        // Check if the PIN provided in the request is correct
        var pinCheck = await new Pin({
            pin: field.pin, userId: res.locals.user_id
        }).validate();

        // If the PIN check fails, return an error response
        if (!pinCheck) {
            return res.status(422).json({ status: false, message: 'Incorrect pin' });
        }

        // If it's a crypto transaction, check the wallet balance
        if (field.sendFrom == 'crypto_wallet') {
            var walletBalance = await WalletBalance.findOne({
                where: {
                    walletId: field.walletId
                }
            });

            // If the wallet balance is insufficient, return an error response
            if (field.amount > walletBalance?.balance!) {
                return res.status(422).json({ status: false, message: 'Insufficient balance' });
            }
        } else {
            // If the payment method is not 'crypto,' check the user's account balance
            var user = await User.findByPk(res.locals.user_id);

            // If the user's account balance is insufficient, return an error response
            if (field.amount > user?.accountBalance!) {
                return res.status(422).json({ status: false, message: 'Insufficient balance' });
            }
        }

        var user = await User.findByPk(res.locals.user_id);

        if (field.sendFrom == 'crypto_wallet') {
            // Decrement the wallet balance
            await WalletBalance.decrement('balance', {
                by: field.amount,
                where: {
                    walletId: field.walletId
                }
            });

            // Increase the user's account balance
            await User.increment('accountBalance', {
                by: field.amount,
                where: {
                    id: res.locals.user_id
                }
            });


            // If it's a crypto transaction, create a new transaction in the wallet
            wallet = await Wallet.findByPk(field.walletId);
            newTransaction = await wallet?.createTransaction({
                amount: field.amount,
                paymentMethod: 'inter_transfer',
                narration: `Transfer to your ${APP_NAME} Wallet`,
                status: 'completed',
                userId: res.locals.user_id,
                beneficiaryName: 'Crypto Wallet',
                reference: reference,
                walletNetwork: ''
            });

            await user?.createTransaction({
                amount: field.amount,
                paymentMethod: 'inter_transfer',
                narration: 'Transfer from your ' + wallet?.name + ' Wallet',
                status: 'completed',
                userId: res.locals.user_id,
                beneficiaryId: res.locals.user_id,
                beneficiaryName: 'Crypto Wallet',
                reference: reference,
                walletNetwork: ''
            });
        } else {
            // Increase the wallet balance
            await WalletBalance.increment('balance', {
                by: field.amount,
                where: {
                    walletId: field.walletId
                }
            });

            // Decrease the user's account balance
            await User.decrement('accountBalance', {
                by: field.amount,
                where: {
                    id: res.locals.user_id
                }
            });

            // If it's a crypto transaction, create a new transaction in the wallet
            wallet = await Wallet.findByPk(field.walletId);
            newTransaction = await wallet?.createTransaction({
                amount: field.amount,
                paymentMethod: 'inter_transfer',
                narration: `Transfer from your ${APP_NAME} Wallet`,
                status: 'completed',
                beneficiaryId: res.locals.user_id,
                reference: reference,
                walletNetwork: ''
            });

            newTransaction = await user?.createTransaction({
                amount: field.amount,
                paymentMethod: 'bank_transfer',
                narration: 'Transfer to your ' + wallet?.name + ' Wallet',
                status: 'completed',
                userId: res.locals.user_id,
                // beneficiaryId: res.locals.user_id,
                beneficiaryName: 'Crypto Wallet',
                reference: reference,
            });
        }

        // Return the list of transactions
        return res.status(200).json({
            status: true, metadata: {
                method: field.paymentMethod,
            },
            transaction: newTransaction, message: 'Transfer successful'
        });
    } catch (error) {
        // Handle errors appropriately, e.g., log them or send an error response
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Export the router for use in your Express application
module.exports = router;


// Define a new route to fetch all transactions for a specific user_id
router.get('/user/transactions', async (req: Request, res: Response) => {
    try {
        // Fetch all transactions associated with the provided user_id
        const transactions = await Transaction.findAll({
            where: {
                walletId: null,

                [Op.or]: {
                    userId: res.locals.user_id,
                    beneficiaryId: res.locals.user_id,
                },
            },
            order: [['id', 'DESC']]
        });

        // Return the list of transactions
        return res.status(200).json(transactions);
    } catch (error) {
        // Handle errors appropriately, e.g., log them or send an error response
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Export the router for use in your Express application
module.exports = router;

