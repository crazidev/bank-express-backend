import { APPLE_ISSUE_ID, APPLE_KEY_ID } from "../config/constants";

const jwt = require("jsonwebtoken");
var fs = require('fs');

export default async function getAppleJWT() {
  // You get privateKey, apiKeyId and issuerId from your Apple App Store Connect account
  const privateKey = fs.readFileSync("./AuthKey_NXU9F86YX7.p8") // this is the file you can only download once and should treat like a real, very precious key.
  const apiKeyId = APPLE_KEY_ID;
  const issuerId = APPLE_ISSUE_ID;
  let now = Math.round((new Date()).getTime() / 1000); // Notice the /1000 
  let nowPlus20 = now + 1199 // 1200 === 20 minutes

  let payload = {
    "iss": issuerId,
    "exp": nowPlus20,
    "aud": "appstoreconnect-v1"
  }

  let signOptions = {
    "algorithm": "ES256", // you must use this algorythm, not jsonwebtoken's default
    header: {
      "alg": "ES256",
      "kid": apiKeyId,
      "typ": "JWT"
    }
  };

  let token = jwt.sign(payload, privateKey, signOptions);
  // console.log('@token: ', token);
  return token;
}

