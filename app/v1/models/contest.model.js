const mongoose = require("mongoose");

const ContestSchema = new mongoose.Schema({
  ContestID: {
    type: String,
    required: true,
    unique: true,
  },
  ContestName: {
    type: String,
    required: true,
  },
  ContestDescription: {
    type: String,
    required: true,
  },
  ContestBanner: {
    type: String,
    required: true,
  },
  ContestStartDate: {
    type: Date,
  },
  LastDateOfRegistration: {
    type: Date,
    required: true,
  },
  RegistrationURL: {
    type: String,
    required: true,
  },
  ContestStatus: {
    type: Boolean,
    required: true,
    // default: "REGISTRATION_OPENED", //REGISTRATION_OPENED,REGISTRATION_CLOSED,CONTEST_STARTED,CONTEST_ENDED
  },
  ContestPrizes: {
    type: Array,
    default: [],
  },
});

const ContestModel = mongoose.model("contests", ContestSchema);
module.exports = ContestModel;
