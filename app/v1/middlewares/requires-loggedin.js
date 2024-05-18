require("dotenv").config();
const customer = require("../models/customer.model");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const PUB_KEY = Buffer.from(process.env.PUBLIC_RSA_KEY, 'base64').toString('ascii');

const RequiresLoggedin = async (req, res, next) => {
  try {
    const accessToken = req.headers?.authorization || req?.cookies?.accessToken;
    if (!accessToken) {
      throw new Error("Forbidden");
    }
    // verify the access token
    const decodedToken = await jwt.verify(accessToken, PUB_KEY, {
      algorithm: "RS256",
    });
    if (!decodedToken) {
      throw new Error("Forbidden");
    }
    const customer_data = await customer.findOne({
      CustomerID: decodedToken.CustomerID,
    });
    if (customer_data?.Disabled) {
      throw new Error("Account is disabled");
    }
    // set the customer data to the request object
    req.decodedToken = decodedToken;
    req.customerData = customer_data;
    next();
  } catch (e) {
    res.status(403).json({ message: e.message, status: 403 });
  }
};

module.exports = RequiresLoggedin;
