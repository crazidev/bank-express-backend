import express, { Request, Response } from "express";
import { ValidationError } from "sequelize";
import { object, string } from "yup";
import { generateAccessToken } from "../../../middleware/JWT";
import { User } from "../../../models";
import Password from "../../../middleware/password";
import sendMail from "../../../middleware/mailer";
import { loginEmail, verificationEmail } from "../../../middleware/email-templates";

var router = express.Router();

/* Login . */
router.post("/admin/login", async function (req: Request, res: Response) {
  var field;
  let validator = object({
    email: string().email().required(),
    password: string().required(),
  });

  try {
    field = validator.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  } catch (e) {
    const error = e as ValidationError;
    return res.status(422).json({ errors: error.errors });
  }

  var user = await User.findOne({
    where: {
      email: field.email,
      isAdmin: true,
    },
  });


  // CHECK IF EMAIL EXIST
  if (user == null) {
    return res.status(404).json({
      status: false,
      statusCode: 'NotExist',
      message: 'User with email address does not exist'
    });
  }

  // CHECK IF EMAIL AND PASSWORD MATCH
  const validatePassword = await new Password({ password: field.password, hash: user.password }).validate();

  if (!validatePassword) {
    return res.status(401).json({
      status: false,
      statusCode: 'IncorrectPassword',
      message: 'Provided password is incorrect'
    });
  }

  // var mail = sendMail({
  //   to: field.email, subject: 'Login Successful', html: loginEmail(), res: res
  // });

  var token = await generateAccessToken({ email: req.body['email'], user_id: user.id, date: Date.now() });
  return res.json({
    status: true,
    token: token,
    message: 'Login successful',
    user,
  });
});


module.exports = router;
