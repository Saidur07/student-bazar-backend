const mongoose = require("mongoose");
const CategoryModel = require("./category.model");

const HomePageAcademiaBookCategorySchema = new mongoose.Schema({
  CategoryID: {
    type: String,
    required: true,
    unique: true,
  },
  ShortDesc: {
    type: String,
    required: true,
  },
  IconURL: {
    type: String,
    required: true,
  },
});

HomePageAcademiaBookCategorySchema.statics.getCategories = async function (cb) {
  const categories = await this.find();
  return categories;
};

const HomePageAcademiaBookCategoryModel = mongoose.model(
  "HomePageAcademiaBookCategory",
  HomePageAcademiaBookCategorySchema
);
module.exports = HomePageAcademiaBookCategoryModel;
