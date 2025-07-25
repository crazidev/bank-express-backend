import express, { Request, Response } from "express";
import db from "../database";
import { authenticateToken } from "../middleware/JWT";
import { Wallet, initModels } from "../models";
import { APP_NAME } from "../config/constants";
var fs = require("fs");

var router = express.Router();

router.all("/sync", async function (req: Request, res: Response) {
  try {
    await db.authenticate();
    console.log("Connection has been established successfully.");
    // await db.drop();
    console.log("Force sync database");
    await db.sync({ alter: true });

    console.log("init database");
    initModels(db);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
  return res.send("Server is working");
});

router.all("/test-db", async function (req: Request, res: Response) {
  try {
    await db.authenticate();
    console.log("Connection has been established successfully.");

    initModels(db);

    return res.send("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    return res.send("Unable to connect to the database");
  }
});

router.use("/user/", authenticateToken, (req, res, next) => {
  next();
});

// router.use("/admin/", authenticateToken, (req, res, next) => {
//   next();
// });

router.all("/", (req, res) => res.type("html").send(html));

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Render!</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
      Hello from ${APP_NAME} Server!
    </section>
  </body>
  <script src="//code.tidio.co/r3omzenqj5d0psoguqgsikdf5j9qhsah.js" async></script>
</html>
`;

module.exports = router;
