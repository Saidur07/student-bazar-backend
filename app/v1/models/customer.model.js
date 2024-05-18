const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  CustomerID: {
    type: String,
    required: true,
    unique: true,
  },
  FullName: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
  },
  EmailVerified: {
    type: Boolean,
    default: false,
  },
  PhoneNumber: {
    type: String,
  },
  PhoneVerified: {
    type: Boolean,
    default: false,
  },
  ProfilePic: {
    type: String,
  },
  DateOfBirth: {
    type: Date,
  },
  Gender: {
    type: String,
  },
  Disabled: {
    type: Boolean,
    required: true,
    default: false,
  },
  PasswordHash: {
    type: String,
  },
  AuthProvider: {
    type: String, // email = EMAIL_PASS , phone = PHONE, google = GOOGLE, facebook = FACEBOOK
    required: true,
  },
}).index({
  CustomerID: "text",
  FullName: "text",
  Email: "text",
  PhoneNumber: "text",
  AuthProvider: "text",
});

const CustomerModel = mongoose.model("customers", CustomerSchema);
CustomerModel.createIndexes();
module.exports = CustomerModel;
