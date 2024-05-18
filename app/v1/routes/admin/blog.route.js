const express = require('express');
const router = express();
const BlogModel = require('../../models/blog.model');
const BlogCategoryModel = require('../../models/blog-category.model');
const { upload } = require('../../middlewares/multer');
const { v4 } = require('uuid');

/**
 * @swagger
 * /api/v1/admin/blog/blog:
 *  get:
 *    tags: [admin-blog]
 *    description: get blogs
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */

router.get('/blog', async (req, res) => {
    try {
        const blogs = await BlogModel.find(req.query);
        res.status(200).json({
            status: 200,
            message: "Success",
            data: blogs
        })
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
});


/**
 * @swagger
 * /api/v1/admin/blog/blog:
 *  post:
 *    tags: [admin-blog]
 *    description: create blog
 *    parameters:
 *      - in: formData
 *        name: title
 *      - in: formData
 *        name: content
 *      - in: formData
 *        name: categories
 *      - in: formData
 *        name: tags
 *      - in: formData
 *        name: thumbnail
 *      - in: formData
 *        name: urlSlug
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.post('/blog', upload.none(), async (req, res) => {
    try {
        const categories = typeof req.body.categories === 'object' ? req.body?.categories : JSON.parse(req.body.categories);
        const tags = typeof req.body.tags === 'object' ? req.body?.tags : JSON.parse(req.body.tags);

        const blog = new BlogModel({
            ...req.body,
            blogID: v4(),
            date: new Date(),
            categories: categories,
            tags: tags
        });
        const savedBlog = await blog.save();
        res.status(200).json({
            status: 200,
            message: "Success",
            data: savedBlog
        })
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
});

/**
 * @swagger
 * /api/v1/admin/blog/blog/{blogID}:
 *  patch:
 *    tags: [admin-blog]
 *    description: edit blog
 *    parameters:
 *      - in: path
 *        name: blogID
 *      - in: formData
 *        name: title
 *      - in: formData
 *        name: content
 *      - in: formData
 *        name: categories
 *      - in: formData
 *        name: tags
 *      - in: formData
 *        name: thumbnail
 *      - in: formData
 *        name: urlSlug
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.patch('/blog/:blogID', upload.none(), async (req, res) => {
    try {
        if (req.body?.categories) {
            const categories = typeof req.body.categories === 'object' ? req.body?.categories : JSON.parse(req.body.categories);
            req.body.categories = categories;
        }
        if (req.body?.tags) {
            const tags = typeof req.body.tags === 'object' ? req.body?.tags : JSON.parse(req.body.tags);
            req.body.tags = tags;
        }

        const updatedBlog = await BlogModel.findOneAndUpdate(
            { blogID: req.params.blogID },
            req.body, { new: true });

        res.status(200).json({
            status: 200,
            message: "Success",
            data: updatedBlog
        })
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
});

/**
 * @swagger
 * /api/v1/admin/blog/blog/{blogID}:
 *  delete:
 *    tags: [admin-blog]
 *    description: delete blog
 *    parameters:
 *      - in: path
 *        name: blogID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.delete('/blog/:blogID', async (req, res) => {
    try {
        const removedBlog = await BlogModel.deleteOne({ blogID: req.params.blogID });
        res.status(200).json({
            status: 200,
            message: "Success",
            data: removedBlog
        })
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
});


module.exports = router;
