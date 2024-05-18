const express = require('express')
const router = express()
const BrandModal = require('../../models/brand.model')

/**
 * @swagger
 * /api/v1/public/brand/:
 *  get:
 *   tags: [public-brand]
 *   description: Get Home Page Banners
 *   responses:
 *    '200':
 *      description: A successful response
 *    '400':
 *      description: Bad request
 * 
 */


router.get('/', async (req, res) => {
    try {
    const brands = await BrandModal.find(req.query)
        res.status(200).json({status:200, brands})
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message })
  }
})

module.exports = router;
