
import express, { Request, Response } from "express";
import fileUpload, { UploadedFile } from 'express-fileupload';
import mime from "mime-types";
import { ValidationError } from "sequelize/types/errors";
import { mixed, object, string } from "yup";
import { User } from "../../models";
const crypto = require('crypto');
const path = require('path');

var router = express.Router();
router.use(fileUpload({
    limits: {
        fileSize: 10000000 // 10mb
    }, abortOnLimit: true
}));
router.post('/user/kyc-verification', async function (req: any, res: Response) {
    var field;

    const allow_file_type = ['png', 'jpeg', 'jpg']; // Accepted file types

    // Function to check file type and return boolean
    function checkType(file: UploadedFile) {

        // var mimeType = mime.extension(file.mimetype).toString();

        // console.log('Uploaded filetype: ', mimeType, file.mimetype);
        // return allow_file_type.includes(mimeType);
        return true
        
    }

    try {
        object({
            profile_img: mixed<UploadedFile>().required().test('is-valid-type', 'Profile image is not a valid image type', value => checkType(value)),
            id_document: mixed<UploadedFile>().required().test('is-valid-type', 'ID document is not a valid image type', value => checkType(value)),
        }).validateSync(req.files, { abortEarly: false, stripUnknown: true });
    } catch (e) {
        const error = e as ValidationError;
        console.log('Stage 1');
        return res.status(422).json({
            errors: error.errors, status: false,
            statusCode: 'ImageTypeError',
        });
    }


    let validator = object({
        ssn: string().required(),
        idDocType: string().oneOf(['national_id', 'drivers_license', 'international_passport']).required()
    });


    try {
        field = validator.validateSync(req.body, { abortEarly: false, stripUnknown: true });
    } catch (e) {
        const error = e as ValidationError;
        console.log('Stage 2');
        return res.status(422).json({
            errors: error.errors, status: false,
            statusCode: 'EmptyField',
        });
    }

    const { profile_img, id_document } = req.files;
    const profile_img_ = profile_img as UploadedFile;
    const id_document_ = id_document as UploadedFile;

    var profile_path = 'public/profile_images/' + crypto.randomUUID() + '.jpg';
    var id_document_path = 'public/id_documents/' + crypto.randomUUID() + '.jpg';

    var user = await User.findOne({
        where: {
            id: res.locals.user_id
        }
    });

    if (user != null) {
        await profile_img_.mv(profile_path).catch((e) => {
            return res.status(422).json({ errors: e });
        });
        await id_document_.mv(id_document_path).catch((e) => {
            return res.status(422).json({ errors: e });
        });

        user.ssn = field.ssn;
        user.ssnStatus = 'uploaded';
        user.idDoc = id_document_path;
        user.idDocType = field.idDocType;
        user.idDocStatus = 'uploaded';
        user.profileImg = profile_path;

        await user.save()
        console.log('Stage 3');
        return res.json({ status: true, message: 'Your documents have been uploaded' });
    } else {
        console.log('Stage 4');
        return res.status(404).json({
            status: false, message: 'Something went wrong',
            statusCode: 'ImageUploadFailed',
        });
    }

});

module.exports = router;
