const express = require('express');
const router = express();
const BlogModel = require('../../models/blog.model');
const BlogCategoryModel = require('../../models/blog-category.model');
const { upload } = require('../../middlewares/multer');

/**
 * @swagger
 * /api/v1/public/blog/blogs:
 *  get:
 *    tags: [public-blog]
 *    description: get blogs
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */

router.get('/blogs', upload.none(), async (req, res) => {
    try {
        const { limit = 10, page = 1, query } = req.query;

        const blogs = query ?
            await BlogModel.find({ $text: { $search: query }, ...req.query })
                .limit(limit).skip((page - 1) * limit)
            : await BlogModel.find(req.query).limit(limit).skip((page - 1) * limit);


        const blogsWithCategory = await Promise.all(
            blogs.map(async (category) => {
                const blogCategories = await BlogCategoryModel.find({ CategoryID: { $in: category.categories } });
                return {
                    ...category._doc,
                    categories: blogCategories
                }
            })
        )

        res.status(200).json({
            status: 200,
            message: "Success",
            data: blogsWithCategory
        })
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
});

/**
 * @swagger
 * /api/v1/public/blog/blog/withID/{blogID}:
 *  get:
 *    tags: [public-blog]
 *    description: get blogs
 *    parameters:
 *     - in: path
 *       name: blogID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.get('/blog/withID/:blogID', upload.none(), async (req, res) => {
    try {
        const blog = await BlogModel.findOne({ blogID: req.params.blogID });
        const categories = await BlogCategoryModel.find({ CategoryID: { $in: blog?.categories } });
        res.status(200).json({
            status: 200,
            message: "Success",
            data: { ...blog?._doc, categories }
        })
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
});

/**
 * @swagger
 * /api/v1/public/blog/blog/withSlug/{blogSlug}:
 *  get:
 *    tags: [public-blog]
 *    description: get blogs
 *    parameters:
 *     - in: path
 *       name: blogSlug
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.get('/blog/withSlug/:blogSlug', upload.none(), async (req, res) => {
    try {
        const blog = await BlogModel.findOne({ urlSlug: req.params.blogSlug });
        const categories = await BlogCategoryModel.find({ CategoryID: { $in: blog?.categories } });
        res.status(200).json({
            status: 200,
            message: "Success",
            data: { ...blog?._doc, categories }
        })
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
});



/**
 * @swagger
 * /api/v1/public/blog/category/with-blog/{categoryID}:
 *  get:
 *    tags: [public-blog]
 *    description: get blogs
 *    parameters:
 *     - in: path
 *       name: categoryID
 *     - in: query
 *       name: limit
 *     - in: query
 *       name: page
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.get('/category/with-blog/:categoryID', async (req, res) => {
    try {
        const { limit = 10, page = 1 } = req.query;
        const { categoryID } = req.params;

        const Category = await BlogCategoryModel.findOne({ CategoryID: categoryID });
        const Blogs = await BlogModel.find({ categories: categoryID }).limit(limit).skip((page - 1) * limit);

        res.status(200).json({
            status: 200,
            message: "Success",
            data: {
                Category,
                Blogs
            }
        })
    } catch (e) {
        res.status(400).json({ message: e.message })
    }
});


module.exports = router;