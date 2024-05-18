const express = require("express");
const ReviewModel = require("../../models/review.model");
const router = express();


/**
 * @swagger
 * /api/v1/public/review/get_reviews/{ProductID}:
 *  get:
 *    tags: [public-reviews]
 *    description: get all reviews with product id
 *    parameters:
 *      - in: path
 *        name: ProductID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */

router.get("/get_reviews/:id", async (req, res) => {
  try {
    const data = await ReviewModel.find({ ProductID: req.params.id, Deleted:false });
    res.status(200).json({ status: 200, reviews: data });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

module.exports = router;
