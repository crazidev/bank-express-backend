import { User } from "../models";

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// access config var
const TOKEN_SECRET = process.env.TOKEN_SECRET;

export function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  try {
    jwt.verify(token, process.env.TOKEN_SECRET ?? TOKEN_SECRET, (err: any, user: any) => {

      res.locals.email = user.email;
      res.locals.user_id = user.user_id;
      next()
    })
  } catch (error) {
    if (error) return res.sendStatus(403)
  }


}

export function generateAccessToken(username: any) {
  return jwt.sign(username, process.env.TOKEN_SECRET ?? TOKEN_SECRET, { expiresIn: '12h' });
}