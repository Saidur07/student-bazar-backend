const mongoose = require("mongoose");

let newdate = new Date(Date.now());

const AdminAuthJwtSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  expiresIn: {
    type: Date,
    required: true,
    default: Date.now() + 20 * 60 * 1000,
  },
  refresh_token: {
    type: String,
    required: true,
  },
  refresh_expiresIn: {
    type: Date,
    required: true,
    default: newdate.setDate(newdate.getDate() + 1),
  },
});

const AdminAuthJwtModels = mongoose.model("admin_auth_jwt", AdminAuthJwtSchema);
module.exports = AdminAuthJwtModels;
