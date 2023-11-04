import { Wallet } from './../../models/Wallet';
import express, { Request, Response } from "express";
import { Bank, Transaction, User } from "../../models";
import { Op } from "sequelize";

var router = express.Router();

router.get('/user/details', async function (req: any, res: any) {
    if (res.locals.user_id == undefined) {
        console.log(res.locals);
        return res.json({
            message: 'User not found',
            user_id: res.locals.user_id,

        });
    }
    var user = await User.findByPk(res.locals.user_id);

    var transaction = await Transaction.findAll({
        include: [
            {
                model: Bank,
                as: 'bank'

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
        where: {
            walletId: null,

            [Op.or]: {
                userId: user?.id,
                beneficiaryId: user?.id
            },
        },
        order: [['id', 'DESC']]
    })
    return res.json({ user, transaction });
});

module.exports = router;
