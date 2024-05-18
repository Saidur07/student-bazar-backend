const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema({
  CustomerID: {
    type: String,
    required: true,
  },
  ProductID: {
    type: String,
    required: true,
  },
  ReviewID:{
    type:String,
    required:true,
    unique:true
  },
  Review: {
    type: String,
  },
  CreatedDate: {
    type: Date,
    default: Date.now,
  },
  Attachments: {
    type: Array,
    default: [],
  },
  Deleted:{
    type: Boolean,
    default:false
  },
  StarCount:{
    type:Number,
    required:true,
    default:5
  },
  Edited:{
    type:Boolean,
    required:true,
    default:false
  },
  VerifiedPurchase:{
    type:Boolean,
    required:true,
    default:false
  }
});

const ReviewModel = mongoose.model("reviews", ReviewSchema);
module.exports = ReviewModel;
