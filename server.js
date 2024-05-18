const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieparser = require("cookie-parser");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const ReportError = require("./app/v1/utility/uncatched-error-logger");
const swaggerDocument = require("./swagger.json");
const v1 = require("./app/v1/index");
require("dotenv").config();
const { PORT = 8000, MONGO_URI } = process.env;

app.get("/", (req, res) => res.status(200).json({ status: 200, messege: "Welcome to Student bazar backend" }))

// cors middleware
app.use(cors({ origin: '*' }));

// body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieparser());
app.use(express.static("public")); // serve static files

// swagger middleware
process.env.PRODUCTION === 'false' && app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(swaggerDocument)))

// app v1 routes
app.use("/api/v1", v1);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  mongoose
    .connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to Database");
    })
    .catch((e) => {
      console.log(e.message);
      console.log("Database Connection Failed");
      ReportError(e)
    });
});


process.on("uncaughtException", (err) => {
  console.log(err.message, err.stack);
  ReportError(err);
})

// console.log(process.env);
// console.log(Buffer.from(process.env.PUBLIC_RSA_KEY, 'base64').toString('ascii'))
// console.log(Buffer.from(process.env.PRIVATE_RSA_KEY, 'base64').toString('ascii'))
// const RSA = `-----BEGIN PUBLIC KEY-----
// MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAld9TkdJPd8znMpS/1fF6
// NFPhH1KQTbX0BZRr0BlKNd/QmKYQt5yKAYfp0p4HhaSnpDNXShUy4OhqW39qZQ5G
// h+pbd60TxlX5yqPw+QFDZsduwJMiNjrTitVFuqvhTZ02yXkusW+VVE0bYD2qGc+j
// fUxCWt+BVHXYDdQFnvmEwqRkP391AXt0LmpXYHKk9WjklWTqsCVg7/PW9f/ro0Yt
// KTV3R4Q20A1cj1ZjT0JguR35iGF8MdDv6QtNHMJSsS6CvEpphcvm45xqZoOAU1Jc
// XfgeZznkd3NXDwlhrgm3Ikdh1z1foh5EDBXaM1mRPMjoCP9aE/PcGfcs6c8t8k31
// IwIDAQAB
// -----END PUBLIC KEY-----`
// console.log(Buffer.from(process.env.PUBLIC_RSA_KEY, 'base64').toString('ascii'))
