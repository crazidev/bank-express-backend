import express from 'express'
import sendMail from '../../middleware/mailer';
import { ValidationError, object, string } from 'yup';
import { User } from '../../models';
import { verificationEmail } from '../../middleware/email-templates';
const router = express();

router.post('/verify-email', async (req, res, next) => {
  var field;
  let validator = object({
    email: string().email().required(),
  });

  try {
    field = validator.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  } catch (e) {
    const error = e as ValidationError;
    return res.status(422).json({ errors: error.errors });
  }

  const token = Math.floor(10000 * Math.random() + 900000);

  var mail = await sendMail({ to: field.email, subject: 'Email Verification', html: verificationEmail(''), res: res });
  if (mail == true) {
    const user = await User.update({
      emailToken: token,
    }, {
      where: {
        email: field.email
      }
    })
    return res.status(200).json({ status: true, message: 'Email verification has been successfully sent to ' + field.email });
  } else {
    return res.status(422).json({ status: false, message: 'Something went wrong' });

  }
})

module.exports = router;