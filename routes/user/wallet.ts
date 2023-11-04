import { number, object, string } from "yup";

import express, { Request, Response } from "express";
import { Op, Sequelize, ValidationError } from "sequelize";
import { Bank, Transaction, User, Wallet } from "../../models";
import { WalletBalance } from "../../models/WalletBalance";
const QRCode = require('qrcode');

var router = express.Router();

// Define a route to get user wallet data and balances
router.get('/user/wallet', async function (req: any, res: Response) {
    try {
        const data: any[] = [];

        const WalletList = await Wallet.findAll({
            include: {
                // required: false,
                model: WalletBalance,
                as: 'walletBalance',
                attributes: ['balance', 'userId', 'id'],
            }
        });

        // Filter the list to include only user-owned wallet balances
        const filteredList = filterWalletBalances(res.locals.user_id, WalletList);

        let totalAmount = await WalletBalance.findAll({
            where: {
                userId: res.locals.user_id,
            },
            attributes: [[Sequelize.fn('sum', Sequelize.col('balance')), 'balance']],
        });

        // Loop through each wallet
        for (const value of filteredList) {
            // Fetch all transactions associated with the user and that specific wallet
            const transactions = await Transaction.findAll({
                where: {
                    userId: res.locals.user_id,
                    [Op.and]: {
                        walletId: value.id,
                    }
                },
            });

            var opts = {
                errorCorrectionLevel: 'H',
                type: 'image/jpeg',
                quality: 1,
                margin: 3,
                scale: 10,
                // version: 5,
                width: 200
            }

            // Generate the QR code as a data URI
            const qrCodeDataUri = await QRCode.toDataURL(value.walletAddress, opts);

            // Push wallet data and balance to the data array
            data.push({
                wallet_id: value.id,
                qrImage: qrCodeDataUri
            });
        }


        return res.json({ status: true, message: '', totalBalance: totalAmount.reduce((acc, item) => item.balance ?? 0, 0).toString(), data: filteredList, metadata: data, });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Internal Server Error', error: error });
    }
});

// Define a function to filter out wallet balances that are not owned by the user
function filterWalletBalances(user_id: number, list: Wallet[]) {
    const filteredList = [];

    for (const wallet of list) {
        // Check if the walletBalance's userId matches the user_id
        if (wallet.walletBalance?.userId === user_id) {
            // If it matches, add the wallet to the filtered list
            filteredList.push(wallet);
        }
    }

    console.log('Returning filtered list', filteredList);
    return filteredList;
}


// Define a route to get user wallet data and balances
router.get('/user/banks', async function (req: any, res: Response) {
    try {
        return res.json({ status: true, message: '', banks: await Bank.findAll() });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Internal Server Error', error: error });
    }
});


// Define a route to fetch transaction history related to a specific wallet ID and user ID
router.get('/user/wallet/:walletId/transactions', async (req: Request, res: Response) => {
    try {
        const { walletId } = req.params;

        const wallet = await Wallet.findByPk(+walletId,);

        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }
        const transactions = await Transaction.findAll({
            where: {
                walletId: walletId,
                [Op.or]: {
                    userId: res.locals.user_id,
                    beneficiaryId: res.locals.user_id
                }
            },
            include: [
                {
                    model: Wallet, as: 'wallet',
                    include: [
                        {
                            model: WalletBalance,
                            as: 'walletBalance',
                            attributes: ['balance', 'wallet_id'],
                            required: false
                        }
                    ]
                },

            ],
            order: [['createdAt', 'DESC']], // Sort by createdAt in descending order (most recent first)
        });

        var balance = 0;
        transactions.forEach(e => {
            if (e.amount != null)
                balance += e.amount;
        })

        return res.status(200).json({
            status: true, message: '',
            balance: balance,
            transactions: transactions,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
