const express = require("express");
const router = express();
const BannerModel = require("../../models/banner.model");

/**
 * @swagger
 * /api/v1/public/banner/home_page_banners:
 *  get:
 *   tags: [public-banner]
 *   description: Get Home Page Banners
 *   responses:
 *    '200':
 *      description: A successful response
 *    '400':
 *      description: Bad request
 * 
 */

router.get("/home_page_banners", async (req, res) => {
  try {
    const banners = await BannerModel.find({});
    res.status(200).json({ status: 200, banners });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/public/banner/{BannerID}:
 *  get:
 *   tags: [public-banner]
 *   description: Get 
 *   parameters:
 *    - in: path
 *      name: BannerID
 *      schema:
 *        type: string
 *        description: Enter banner id
 *   responses:
 *    '200':
 *      description: A successful response
 *    '400':
 *      description: Bad request
 * 
 */

router.get('/:id', async (req, res) => {
  try {
  const banner = await BannerModel.findOne({BannerID:req.params.id})
    res.status(200).json({status:200, banner})
} catch (e) {
  res.status(400).json({ status: 400, message: e.message })
}
})

module.exports = router;
