import { Wallet } from './../../../models/Wallet';
import express, { Request, Response } from "express";
import { Bank, Livechat, Transaction, User } from "../../../models";
import { DATE, Op } from "sequelize";
import * as yup from 'yup';
import mime from "mime-types";
import fileUpload, { UploadedFile } from 'express-fileupload';
import sendPush from '../../../middleware/send-push';
const crypto = require('crypto');
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

TimeAgo.addDefaultLocale(en)

var router = express.Router();
router.post('/admin/livechat', async function (req: any, res: Response) {
    var field;
    const allow_file_type = ['png', 'jpeg', 'jpg']; // Accepted file types

    function checkType(file: UploadedFile) {

        // var mimeType = mime.extension(file.mimetype).toString();

        // console.log('Uploaded filetype: ', mimeType, file.mimetype);
        // return allow_file_type.includes(mimeType);
        return true
    }

    let validator = yup.object({
        message: yup.string().required(),
        userId: yup.number().optional(),
        fromAdmin: yup.boolean().optional(),
        type: yup.string().required().oneOf(['text', 'image', 'file']),
    });

    try {
        field = validator.validateSync(req.body, { abortEarly: false, stripUnknown: true });
    } catch (e) {
        const error = e as yup.ValidationError;
        return res.status(422).json({ errors: error.errors });
    }

    if (field.type == 'text') {
        await Livechat.create({
            message: field.message,
            type: 'text',
            fromAdmin: field.fromAdmin ?? false,
            userId: field.userId ?? res.locals.user_id
        });
    } else {
        try {
            yup.object({
                fileUrl: yup.mixed<UploadedFile>().required().test('is-valid-type', 'image is not a valid image type', value => checkType(value)),
            }).validateSync(req.files, { abortEarly: false, stripUnknown: true });
        } catch (e) {
            const error = e as yup.ValidationError;
            return res.status(422).json({
                errors: error.errors, status: false,
                statusCode: 'ImageTypeError',
            });
        }

        // var user = await User.findByPk(field.userId ?? res.locals.user_id);

        // if (user?.pushId != null)
        //     sendPush({
        //         heading: 'Livechat',
        //         content: 'New livechat message',
        //         subscription_ids: [user?.pushId],
        //     });


        const { fileUrl } = req.files;
        const file_ = fileUrl as UploadedFile;
        var file_path = 'public/livechat/' + crypto.randomUUID() + '.jpg';

        await file_.mv(file_path).catch((e) => {
            return res.status(422).json({ errors: e });
        });

        await Livechat.create({
            message: '',
            type: 'image',
            fileUrl: file_path,
            fromAdmin: field.fromAdmin ?? false,
            userId: field.userId ?? res.locals.user_id
        });

    }

    var livechat = await Livechat.findAll({
        where: {
            userId: res.locals.user_id
        },
        order: [['id', 'DESC']]
    });
    return res.json({ livechat });

});

module.exports = router;
