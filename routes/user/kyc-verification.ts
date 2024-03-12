import express, { Request, Response } from "express";
import fileUpload, { UploadedFile } from "express-fileupload";
import mime from "mime-types";
import { ValidationError } from "sequelize/types/errors";
import { mixed, object, string } from "yup";
import { User } from "../../models";
const crypto = require("crypto");
const path = require("path");
import { TransformationOptions, v2 as cloudinary } from "cloudinary";

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

router.post("/user/kyc-verification", async function (req: any, res: Response) {
  var field: {
    ssn: string;
    idDocType: NonNullable<
      "national_id" | "drivers_license" | "international_passport" | undefined
    >;
  };

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
      id_document: mixed<UploadedFile>()
        .required()
        .test(
          "is-valid-type",
          "ID document is not a valid image type",
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
    ssn: string().required(),
    idDocType: string()
      .oneOf(["national_id", "drivers_license", "international_passport"])
      .required(),
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

  const { profile_img, id_document } = req.files;
  const profile_img_ = profile_img as UploadedFile;
  const id_document_ = id_document as UploadedFile;

  // Use crypto to generate unique file names
  const profile_filename =
    crypto.randomBytes(16).toString("hex") + path.extname(profile_img_.name);
  const id_document_filename =
    crypto.randomBytes(16).toString("hex") + path.extname(id_document_.name);

  var user = await User.findOne({
    where: {
      id: res.locals.user_id,
    },
  });

  if (user != null) {
    cloudinary.uploader
      .upload(profile_img_.tempFilePath, {
        public_id: `${process.env.APP_NAME}/profile_images/` + profile_filename,
        transformation: {
          width: 200,
        },
      })
      .then(async (profileResult) => {
        cloudinary.uploader
          .upload(id_document_.tempFilePath, {
            public_id:
              `${process.env.APP_NAME}/id_documents/` + id_document_filename,
          })
          .then(async (idDocResult) => {
            if (user != null) {
              user.ssn = field.ssn;
              user.ssnStatus = "uploaded";
              user.idDoc = idDocResult.secure_url;
              user.idDocType = field.idDocType;
              user.idDocStatus = "uploaded";
              user.profileImg = profileResult.secure_url;

              await user.save();
              return res.json({
                status: true,
                message: "Your documents have been uploaded",
              });
            }
          })
          .catch((e) => {
            console.error(e);
            return res.status(500).json({
              status: false,
              message: "Error uploading ID document to Cloudinary",
              statusCode: "ImageUploadFailed",
            });
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
});

module.exports = router;
