const express = require('express');
const router = express();
const { v4 } = require('uuid');
const CategoryModel = require('../../models/blog-category.model');
const { upload } = require('../../middlewares/multer');

/**
 * @swagger
 * /api/v1/public/blog-category/:
 *  get:
 *    tags: [public-blog-category]
 *    description: get blog categories
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */

router.get('/', async (req, res) => {
    try {
        const categories = await CategoryModel.find(req.query);
        res.status(200).json({
            status: 200,
            message: "Success",
            data: categories
        })
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
})

module.exports = router;