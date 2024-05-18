const express = require('express')
const router = express()
const HomeAcademiaModel = require('../../models/home-page-academia-book-category.model')
const CategoryModel = require('../../models/category.model')


/**
 * @swagger
 * /api/v1/public/home-page-academic-book-category/:
 *  get:
 *    tags: [public-home-page-academic-book-category]
 *    description: Get Customer data
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */

router.get('/', async (req, res) => {
    try {
        const categories = await HomeAcademiaModel.getCategories()
        const categories_with_category = await Promise.all(
            categories.map(async (category) => {
                const category_data = await CategoryModel.findOne({ CategoryID: category.CategoryID })
                return {
                    ...category?.toJSON(),
                    ...category_data?.toJSON()
                }
            })
        )
        res.status(200).json({ categories_with_category })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})

module.exports = router