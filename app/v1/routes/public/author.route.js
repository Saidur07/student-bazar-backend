const express = require('express')
const router = express()
const AuthorModel = require('../../models/author.model')
const CategoryModel = require('../../models/category.model')
const ProductsModel = require('../../models/product.model')
const PublicationModel = require('../../models/publication.model')

const getChildCategories = async (categoryID) => {
    const categories = await CategoryModel.find({ ParentCategoryID: categoryID })
    const childCategories = await Promise.all(
        categories.map(async (category) => {
            const childCategories = await getChildCategories(category.CategoryID)
            return {
                ...category.toJSON(),
                childCategories,
            }
        })
    )
    return childCategories
}

/**
 * @swagger
 * /api/v1/public/author/all_authors:
 *  get:
 *   tags: [public-author]
 *   description: Get All Authors
 *   parameters:
 *    - in: query
 *      name: page
 *      schema:
 *        type: string
 *        description: Enter page number
 *    - in: query
 *      name: limit
 *      schema:
 *        type: string
 *        description: Enter limit
 *   responses:
 *    '200':
 *      description: A successful response
 *    '400':
 *      description: Bad request
 * 
 */


router.get('/all_authors', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query
        const all_authors = await AuthorModel.find({ ...req.query }).limit(limit).skip((page - 1) * limit)
        res.status(200).json({ status: 200, authors: all_authors })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})


/**
 * @swagger
 * /api/v1/public/author/popular_authors:
 *  get:
 *   tags: [public-author]
 *   description: Get Popular Authors
 *   parameters:
 *    - in: query
 *      name: page
 *      schema:
 *        type: string
 *        description: Enter page number
 *    - in: query
 *      name: limit
 *      schema:
 *        type: string
 *        description: Enter limit
 * 
 *   responses:
 *    '200':
 *      description: A successful response
 *    '400':
 *      description: Bad request
 * 
 */


router.get('/popular_authors', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query
        const popular_authors = await AuthorModel.find({ Popular: true }).limit(limit).skip((page - 1) * limit).sort({ BookCount: -1 })
        res.status(200).json({ status: 200, authors: popular_authors })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})


/**
 * @swagger
 * /api/v1/public/author/author_detail:
 *  get:
 *   tags: [public-author]
 *   description: Get Popular Authors
 *   parameters:
 *    - in: query
 *      name: AuthorID
 *      schema:
 *        type: string
 *        description: Enter Author ID
 *    - in: query
 *      name: AuthorSlug
 *      schema:
 *        type: string
 *        description: Enter Author Slug
 *   responses:
 *    '200':
 *      description: A successful response
 *    '400':
 *      description: Bad request
 * 
 */

router.get('/author_detail', async (req, res) => {
    try {
        const author_info = await AuthorModel.findOne(req?.query);
        const products = await ProductsModel.find({ AuthorID: author_info?.AuthorID }, 'PublicationID CategoryID')

        let publication_id_array = []
        products.map(product => !(publication_id_array.includes(product.PublicationID)) && publication_id_array.push(product.PublicationID))
        const publications = await PublicationModel.find({ PublicationID: { $in: publication_id_array } }, 'PublicationID PublicationName PublicationNameBN PublicationSlug')

        const categoryIDList = products.map(product => product.CategoryID)
        const categoryID = [].concat(...categoryIDList)

        let all_category_under_author = await CategoryModel.find({ CategoryID: { $in: categoryID } })

        const all_categories_with_child = await Promise.all(
            all_category_under_author.map(async (category) => {
                const childCategories = await getChildCategories(category.CategoryID)

                return {
                    ...category.toJSON(),
                    childCategories,
                }
            })
        )

        res.status(200).json({
            status: 200,
            author: author_info,
            publications,
            categories: all_categories_with_child
        });
    }
    catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})


module.exports = router;
