const mongoose = require("mongoose");

const ProductScheme = new mongoose.Schema({
  ProductID: {
    type: String,
    required: true,
    unique: true,
  },
  SKU: {
    type: String,
    // required: true,
  },
  ProductTitle: {
    type: String,
    required: true,
  },
  ProductBanglishTitle: {
    type: String,
    required: true,
  },
  ProductDesc: {
    type: String,
    required: true,
  },
  ProductType: {
    type: String, // BOOK | FASHION | STATIONARY
    required: true,
  },
  CategoryID: {
    type: [String],
    required: true,
  },
  QuantityPerUnit: {
    type: Number,
    // required: true,
    default: 1,
  },
  RegularPrice: {
    type: Number,
    required: true,
  },
  SalePrice: {
    type: Number,
    required: true,
  },
  UnitWeight: {
    type: Number,
    // required: true,
  },
  UnitInStock: {
    type: Number,
    required: true,
  },
  ProductAvailable: {
    type: Boolean,
    required: true,
    default: false,
  },
  DiscountAvailable: {
    type: Boolean,
    required: true,
  },
  Picture: {
    type: String,
    required: true,
  },
  Tags: {
    type: [String],
    // required:true
  },
  PublicationID: {
    type: Number,
    // required:true
  },
  AuthorID: {
    type: Number,
    // required:true
  },
  BrandID: {
    type: Number,
  },
  ISBNNumber: {
    type: String,
    // required:true
  },
  URLSlug: {
    type: String,
    required: true,
    unique: true,
  },
  Created: {
    type: Date,
    required: true,
    default: new Date(),
  },
  LastUpdated: {
    type: Date,
    required: true,
  },
  Sold: {
    type: Number,
    required: true,
    default: 0,
  },
  Reviews: {
    type: String,
    required: true,
    default: 0,
  },
  BookPDF: {
    type: String
  },
  Rating: {
    type: String,
    required: true,
    default: 0,
  },
  Deleted: {
    type: Boolean,
    required: true,
  },
  ShortDesc: {
    type: String,
    required: true
  },
  CustomAttributes: {
    type: [
      {
        AttributeName: String,
        AttributeValue: String,
      },
    ],
  },
}).index({ ProductTitle: 'text', ProductBanglishTitle: 'text', ProductDesc: 'text', Tags: 'text', ShortDesc: "text", CustomAttributes: "text" })

const ProductsModel = mongoose.model("products", ProductScheme);
ProductsModel.createIndexes()
module.exports = ProductsModel;
