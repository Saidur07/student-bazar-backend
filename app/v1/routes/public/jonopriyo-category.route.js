const express = require("express");
const router = express();
const JonopriyoBoiModel = require("../../models/jonopriyo-category.model");
const CategoryModel = require("../../models/category.model");
const ProductModel = require("../../models/product.model");
/**
 * @swagger
 * /api/v1/public/jonopriyo-category/:
 *  get:
 *    tags: [public-jonopriyo-category]
 *    description: Get Customer data
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */

router.get("/", async (req, res) => {
  try {
    const categories = await JonopriyoBoiModel.getCategories();
    // send with image 
    const categories_with_image = await Promise.all(
      categories.map(async (category) => {
        const products = await ProductModel.find({
          CategoryID: category.CategoryID,
        }).limit(4);
        const images = products.map((product) => product?.Picture);
        return {
          ...category,
          images: images,
        };
      }))

    res.status(200).json({ categories_with_image });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

module.exports = router;
