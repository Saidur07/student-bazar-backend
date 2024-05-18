const mongoose = require("mongoose");

const OfferSchema = new mongoose.Schema({
  OfferID: {
    type: String,
    required: true,
  },
  OfferName: {
    type: String,
    required: true,
  },
  OfferDesc: {
    type: String,
    required: true,
  },
  DiscountPercent: {
    type: String,
    required: true,
  },
  OfferStartingDate: {
    type: Date,
    required: true,
  },
  OfferEndingDate: {
    type: Date,
    required: true,
  },
  OfferType: {
    type: String, //CATEGORY || PRODUCT
    required: true,
  },
  Categories: {
    type: [String],
  },
  Products: {
    type: [String],
  },
  OfferStatus: {
    type: String, //UPCOMING || ACTIVE || INACTIVE
    required: true,
    default: "UPCOMING",
  },
});

const OfferModel = mongoose.model("offers", OfferSchema);
module.exports = OfferModel;
