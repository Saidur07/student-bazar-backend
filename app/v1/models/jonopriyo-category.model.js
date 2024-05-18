const mongoose = require("mongoose");
const CategoryModel = require("./category.model");
const ProductModel = require("./product.model");

const JonopriyoBoiSchema = new mongoose.Schema({
  CategoryID: {
    type: String,
    required: true,
    unique: true,
  },
  Title: {
    type: String,
    required: true,
  },
});

JonopriyoBoiSchema.statics.getCategories = async function (cb) {
  const jonopriyo_categories = await this.find();
  const category_ids = jonopriyo_categories.map(
    (jonopriyo_category) => jonopriyo_category.CategoryID
  );
  const categories = await CategoryModel.find(
    { CategoryID: { $in: category_ids } },
    cb
  );

  const categories_with_title = categories.map((c) => {
    const Title = jonopriyo_categories.filter(
      (category) => category.CategoryID === c.CategoryID
    )[0]?.Title;
    return {
      ...c._doc,
      Title,
    };
  });
  return categories_with_title;
};

JonopriyoBoiSchema.statics.addCategory = async function (CategoryID, Title) {
  const category = await CategoryModel.findOne({ CategoryID });
  if (!category?.CategoryID) {
    throw new Error("Category not found");
  }
  const jonopriyo_category = await this.findOne({ CategoryID });
  if (jonopriyo_category?.CategoryID) {
    throw new Error("Category already exists");
  }
  const new_jonopriyo_category = new this({ CategoryID, Title: Title });
  return await new_jonopriyo_category.save();
};

const JonopriyoBoiModel = mongoose.model("JonopriyoBoi", JonopriyoBoiSchema);
module.exports = JonopriyoBoiModel;
