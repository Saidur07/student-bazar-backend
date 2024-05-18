const express = require('express');
const router = express();
const { v4 } = require('uuid');
const CategoryModel = require('../../models/blog-category.model');
const { upload } = require('../../middlewares/multer');

/**
 * @swagger
 * /api/v1/admin/blog-category/:
 *  get:
 *    tags: [admin-blog-category]
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

/**
 * @swagger
 * /api/v1/admin/blog-category/category:
 *  post:
 *    tags: [admin-blog-category]
 *    description: add category
 *    parameters:
 *      - in: formData
 *        name: CategoryName
 *      - in: formData
 *        name: CategoryDescription
 *      - in: formData
 *        name: CategoryURLSlug
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.post('/category', upload.none(), async (req, res) => {
    try {
        const uid = v4();
        console.log(uid);
        console.log(req.body);
        const category = new CategoryModel({
            CategoryID: uid,
            CategoryName: req?.body?.CategoryName,
            CategoryDescription: req?.body?.CategoryDescription,
            CategoryURLSlug: req?.body?.CategoryURLSlug
        });
        const savedCategory = await category.save();
        res.status(200).json({
            status: 200,
            message: "Success",
            data: savedCategory
        })
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
})

/**
 * @swagger
 * /api/v1/admin/blog-category/category/{categoryID}:
 *  patch:
 *    tags: [admin-blog-category]
 *    description: edit category
 *    parameters:
 *      - in: path
 *        name: categoryID
 *      - in: formData
 *        name: CategoryName
 *      - in: formData
 *        name: CategoryDescription
 *      - in: formData
 *        name: CategoryURLSlug
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.patch('/category/:categoryID', async (req, res) => {
    try {
        const updatedCategory = await CategoryModel.updateOne(
            { CategoryID: req.params.categoryID },
            req.body);

        res.status(200).json({
            status: 200,
            message: "Success",
            data: updatedCategory
        })
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
})

/**
 * @swagger
 * /api/v1/admin/blog-category/category/{categoryID}:
 *  delete:
 *    tags: [admin-blog-category]
 *    description: delete category
 *    parameters:
 *      - in: path
 *        name: categoryID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.delete('/category/:categoryID', async (req, res) => {
    try {
        const deletedCategory = await CategoryModel.deleteOne(
            {
                CategoryID: req.params.categoryID
            });
        res.status(200).json({
            status: 200,
            message: "Success",
            data: deletedCategory
        })
    }
    catch (e) {
        res.status(400).json({ message: e.message })
    }
})

module.exports = router;