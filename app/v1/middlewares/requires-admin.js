require("dotenv").config();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const PUB_KEY = Buffer.from(process.env.PUBLIC_RSA_KEY, 'base64').toString('ascii');
const AdminAuthModal = require("../models/admin-auth.model");

const RequiresAdmin = async (req, res, next) => {
  try {
    const token = req.headers?.authorization || req.cookies?.token;
    const decodedToken = jwt.verify(token, PUB_KEY, { algorithm: "RS256" });

    if (!decodedToken) {
      return res.status(403).json({ message: "Forbidden", status: 403 });
    }

    const admin_data = await AdminAuthModal.findOne({
      username: decodedToken.username,
    });
    console.log(admin_data);
    if (!admin_data?.username) {
      return res.status(403).json({ message: "Forbidden", status: 403 });
    }

    if (admin_data?.disabled) {
      return res.status(403).json({ message: "Forbidden", status: 403 });
    }

    req.admin = admin_data;
    req.decodedToken = decodedToken;
    next();
  } catch (error) {
    console.log(error);
    res.status(403).json({ message: "Forbidden", status: 403 });
  }
};

module.exports = RequiresAdmin;
