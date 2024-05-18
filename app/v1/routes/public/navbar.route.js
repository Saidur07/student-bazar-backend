const express = require('express');
const router = express()
const Navbar = require('../../models/navbar.model');
const { upload } = require('../../middlewares/multer');

/**
 * @swagger
 * /api/v1/public/navbar/:
 *  get:
 *    tags: [public-navbar]
 *    description: Get navbar items
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.get('/', async (req, res) => {
    try {
        const items = await Navbar.find({}).sort({ index: 1 });
        res.status(200).json(items);
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message });
    }
})


module.exports = router;