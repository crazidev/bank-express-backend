import express, { Request, Response } from "express";
import fileUpload, { UploadedFile } from "express-fileupload";
import mime from "mime-types";
import { ValidationError } from "sequelize/types/errors";
import { mixed, number, object, string } from "yup";
const crypto = require("crypto");
const path = require("path");
import { TransformationOptions, v2 as cloudinary } from "cloudinary";
import { User } from "../../../models";

var router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

router.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: ".tmp/",

    limits: {
      fileSize: 10000000, // 10mb
    },
    abortOnLimit: true,
  })
);

router.post(
  "/admin/change-user-profile-pic",
  async function (req: any, res: Response) {
    var field;

    const allow_file_type = ["png", "jpeg", "jpg"]; // Accepted file types

    // Function to check file type and return boolean
    function checkType(file: UploadedFile) {
      // var mimeType = mime.extension(file.mimetype).toString();
      // console.log('Uploaded filetype: ', mimeType, file.mimetype);
      // return allow_file_type.includes(mimeType);
      return true;
    }

    try {
      object({
        profile_img: mixed<UploadedFile>()
          .required()
          .test(
            "is-valid-type",
            "Profile image is not a valid image type",
            (value) => checkType(value)
          ),
      }).validateSync(req.files, { abortEarly: false, stripUnknown: true });
    } catch (e) {
      const error = e as ValidationError;
      return res.status(422).json({
        errors: error.errors,
        status: false,
        statusCode: "ImageTypeError",
      });
    }

    let validator = object({
      user_id: number().required(),
    });

    try {
      field = validator.validateSync(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
    } catch (e) {
      const error = e as ValidationError;
      return res.status(422).json({
        errors: error.errors,
        status: false,
        statusCode: "EmptyField",
      });
    }

    const { profile_img } = req.files;
    const profile_img_ = profile_img as UploadedFile;

    // Use crypto to generate unique file names
    const profile_filename =
      crypto.randomBytes(16).toString("hex") + path.extname(profile_img_.name);

    var user = await User.findOne({
      where: {
        id: field.user_id,
      },
    });

    if (user != null) {
      cloudinary.uploader
        .upload(profile_img_.tempFilePath, {
          public_id:
            `${process.env.APP_NAME}/profile_images/` + profile_filename,
          transformation: {
            width: 200,
          },
        })
        .then(async (profileResult) => {
          user!.profileImg = profileResult.secure_url;

          await user!.save();
          return res.json({
            status: true,
            message: "Profile picture updated successfully",
          });
        })
        .catch((e) => {
          console.error(e);
          return res.status(500).json({
            status: false,
            message: "Error uploading profile image to Cloudinary",
            statusCode: "ImageUploadFailed",
          });
        });
    } else {
      return res.status(404).json({
        status: false,
        message: "Something went wrong",
        statusCode: "ImageUploadFailed",
      });
    }
  }
);

module.exports = router;
