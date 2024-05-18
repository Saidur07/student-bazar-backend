const express = require('express')
const router = express()
const ProductModel = require('../../models/product.model')
const AuthorModel = require('../../models/author.model')
const PublicationModel = require('../../models/publication.model')
const CategoryModel = require('../../models/category.model')
const BrandModal = require('../../models/brand.model')
const DistrictsModel = require('../../models/districts.model')
const DivisionModel = require('../../models/division.model')
const upazillaModel = require('../../models/upazilla.model')
const BrandModel = require('../../models/brand.model')

/**
 * @swagger
 * /api/v1/public/product/author:
 *  get:
 *    tags: [public-product]
 *    description: get product with authorID
 *    parameters:
 *      - in: query
 *        name: AuthorID
 *      - in: query
 *        name: limit
 *      - in: query
 *        name: page
 *      - in: query
 *        name: SortBy
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.get('/author', async (req, res) => {
    try {
        const { AuthorID, page = 1, limit = 10, SortBy = "POPULARITY" } = req.query;

        const data = await ProductModel.find({ AuthorID, Deleted: false })
            .limit(limit)
            .skip((page - 1) * limit)
            .sort(SortBy == "LOW_TO_HIGH" ? { SalePrice: 1 } : SortBy == "HIGH_TO_LOW" ? { SalePrice: -1 } : { Sold: 1 })

        res.status(200).json({ status: 200, products: data })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})


/**
 * @swagger
 * /api/v1/public/product/category:
 *  get:
 *    tags: [public-product]
 *    description: Category wise product
 *    parameters:
 *      - in: query
 *        name: CategoryID
 *      - in: query
 *        name: limit
 *      - in: query
 *        name: page
 *      - in: query
 *        name: SortBy
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */

router.get('/category', async (req, res) => {
    try {
        const { CategoryID, page = 1, limit = 10 } = req.query
        const data = await ProductModel.find({ CategoryID, Deleted: false })

        res.status(200).json({ status: 200, products: data })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})

/**
 * @swagger
 * /api/v1/public/product/product_detail:
 *  get:
 *    tags: [public-product]
 *    description: get product detail
 *    parameters:
 *      - in: query
 *        name: ProductID
 *      - in: query
 *        name: ProductSlug
 *      - in: query
 *        name: limit
 *      - in: query
 *        name: page
 *      - in: query
 *        name: SortBy
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */

router.get('/product_detail', async (req, res) => {
    try {
        const params = req.query;
        let ProductDetails = await ProductModel.findOne({ ...params, Deleted: false });
        const AuthorDetails = await AuthorModel.findOne({ AuthorID: ProductDetails?.AuthorID })
        const PublicationDetails = await PublicationModel.findOne({ PublicationID: ProductDetails?.PublicationID })
        const BrandDetails = await BrandModal.findOne({ BrandID: ProductDetails?.BrandID })

        const categories = await CategoryModel.find({ CategoryID: ProductDetails?.CategoryID })

        ProductDetails = ProductDetails.toJSON()
        ProductDetails.author = AuthorDetails
        ProductDetails.publication = PublicationDetails
        ProductDetails.brand = BrandDetails
        ProductDetails.categories = categories

        res.status(200).json({ status: 200, product: ProductDetails });
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message });
    }
})

/**
 * @swagger
 * /api/v1/public/product/search:
 *  get:
 *    description: search product
 *    tags: [public-product]
 *    parameters:
 *      - in: query
 *        name: query
 *      - in: query
 *        name: SortBy
 *        type: select
 *        enum: [POPULARITY, LOW_TO_HIGH, HIGH_TO_LOW]
 *      - in: query
 *        name: categories
 *      - in: query
 *        name: AuthorID
 *      - in: query
 *        name: PublicationID
 *      - in: query
 *        name: BrandID
 *      - in: query
 *        name: ProductType
 *    responses:
 *      '200':
 *        description: A successful response
 *      '404':
 *        description: Bad request
 */

// url-> search?query=[name]&&page=[page]&&limit=[limit]
router.get('/search', async (req, res) => {
    try {
        const { query, page = 1, limit = 10, SortBy = "POPULARITY", categories, AuthorID, PublicationID, BrandID, ProductType } = req.query;

        const data = await ProductModel.find({ $text: { $search: query }, ...req.query })
            .limit(limit).skip((page - 1) * limit)
            .sort(SortBy === "LOW_TO_HIGH" ? { SalePrice: 1, Sold: 1 } : SortBy === "HIGH_TO_LOW" ? { SalePrice: -1 } : { Sold: 1 })

        const authors = await AuthorModel.find({ AuthorID: { $in: data.map(item => item.AuthorID) } })
        const publications = await PublicationModel.find({ PublicationID: { $in: data.map(item => item.PublicationID) } })
        const brands = await BrandModel.find({ BrandID: { $in: data.map(item => item.BrandID) } })

        res.status(200).json({ status: 200, products: data, authors, publications, brands })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})

/**
 * @swagger
 * /api/v1/public/product/shipping_data:
 *  get:
 *    description: get shipping data
 *    tags: [public-product]
 *    parameters:
 *      - in: query
 *        name: district_id
 *      - in: query
 *        name: division_id
 *      - in: query
 *        name: upazila_id
 *    responses:
 *      '200':
 *        description: A successful response
 *      '404':
 *        description: Bad request
 */
// Get delivery fee
router.get('/shipping_data', async (req, res) => {
    try {
        const { district_id = 1, division_id = 3, upazila_id = 565 } = req.query

        const Division = await DivisionModel.findOne({ division_id: division_id })
        const District = await DistrictsModel.findOne({ district_id: district_id, division_id: division_id })
        const Upazilla = await upazillaModel.findOne({ upazila_id: upazila_id, district_id: district_id })

        const data = {
            division: Division,
            district: District,
            upazilla: Upazilla
        }

        res.status(200).json({ status: 200, data })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})

/**
 * @swagger
 * /api/v1/public/product/similar_products:
 *  get:
 *    description: Get simmilar products
 *    tags: [public-product]
 *    parameters:
 *      - in: query
 *        name: ProductID
 *    responses:
 *      '200':
 *        description: A successful response
 *      '404':
 *        description: Bad request
 */

router.get('/similar_products', async (req, res) => {
    try {
        const { ProductID, page = 1, limit = 10 } = req.query;
        const product_data = await ProductModel.findOne({ ProductID, Deleted: false })
        const CategoryID = product_data?.CategoryID ? product_data.CategoryID : [];

        const data = await ProductModel.find({ CategoryID: { $in: CategoryID } }).limit(limit).skip((page - 1) * limit).sort({ Sold: -1 })
        const filtered_data = data.filter(item => item.ProductID !== ProductID)

        res.status(200).json({ status: 200, products: filtered_data })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})

// router.get('/subject_page_product', async (req, res) => {
//     try {
//         const { SubjectID, page = 1, limit = 10 } = req.query;
//         const data = await ProductModel.find({ SubjectID: SubjectID, Deleted: false }).limit(limit).skip((page - 1) * limit)
//         res.status(200).json({ status: 200, products: data })
//     } catch (e) {
//         res.status(400).json({ status: 400, message: e.message })
//     }
// })

/**
 * @swagger
 * /api/v1/public/product/products-with-product-type:
 *  get:
 *    description: Get products with product type
 *    tags: [public-product]
 *    parameters:
 *     - in: query
 *       name: ProductType
 *     - in: query
 *       name: page
 *     - in: query
 *       name: limit
 *     - in: query
 *       name: CategoryID
 *     - in: query
 *       name: BrandID
 *     - in: query
 *       name: AuthorID
 *     - in: query
 *       name: PublicationID
 *     - in: query
 *       name: page
 *     - in: query
 *       name: limit
 *     - in: query
 *       name: status
 *       type: select
 *       enum: [ALL, AVAILABILITY, UNAVAILABILITY]
 *     - in: query
 *       name: SortBy
 *       type: select
 *       enum: [LOW_TO_HIGH, HIGH_TO_LOW]
 *    responses:
 *      '200':
 *        description: A successful response
 *      '404':
 *        description: Bad request
 */

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

router.get('/products-with-product-type', async (req, res) => {
    try {
        const { ProductType, CategoryID, page = 1, limit = 10, status = 'ALL', SortBy } = req.query;
        if (!ProductType) throw new Error("ProductType is required")
        const childCategories = await getChildCategories(CategoryID)

        const allCategoryID = [...childCategories.flat(Infinity).map(item => item.CategoryID)]
        if (CategoryID) {
            allCategoryID.push(CategoryID)
        }
        console.log(allCategoryID)
        const data = allCategoryID.length > 0
            ? await ProductModel.find(
                {
                    ProductType: ProductType,
                    CategoryID: allCategoryID,
                    Deleted: false,
                    UnitInStock: status === 'AVAILABILITY' ? { $gt: 0 } : status === "UNAVAILABILITY" ? 0 : { $gt: -1 },
                    ...req.query
                })
                .limit(limit)
                .skip((page - 1) * limit)
                .sort(
                    SortBy ? SortBy === "LOW_TO_HIGH"
                        ? { SalePrice: 1 }
                        : SortBy === "HIGH_TO_LOW"
                            ? { SalePrice: -1 }
                            : { Sold: -1 } : {}
                )
            : await ProductModel.find(
                {
                    ProductType: ProductType,
                    Deleted: false,
                    UnitInStock: status === 'AVAILABILITY' ? { $gt: 0 } : status === "UNAVAILABILITY" ? 0 : { $gt: -1 },
                    ...req.query
                })
                .limit(limit)
                .skip((page - 1) * limit)
                .sort(
                    SortBy ? SortBy === "LOW_TO_HIGH"
                        ? { SalePrice: 1 }
                        : SortBy === "HIGH_TO_LOW"
                            ? { SalePrice: -1 }
                            : { Sold: -1 } : {}
                )

        // const all_categories_with_child = await Promise.all(
        //     all_categories.map(async (category) => {
        //         const childCategories = await getChildCategories(category.CategoryID)

        //         return {
        //             ...category.toJSON(),
        //             childCategories,
        //         }
        //     })
        // )
        let categories = CategoryID ? await CategoryModel.find({ ParentCategoryID: CategoryID }) : await CategoryModel.find({ ParentCategoryID: "0", ProductType })
        if (!categories?.length) {
            const parentCategory = await CategoryModel.findOne({ CategoryID })
            categories = await CategoryModel.find({ ParentCategoryID: parentCategory?.ParentCategoryID, ProductType })
        }

        let breadcrumbs = {}
        let finding = true
        let categoryID = CategoryID
        if (categoryID) {
            while (finding) {
                const category = await CategoryModel.findOne({ CategoryID: categoryID })
                breadcrumbs = {
                    ...category._doc,
                    child: breadcrumbs
                }

                if (category.ParentCategoryID === "0") {
                    finding = false
                }
                categoryID = category.ParentCategoryID
            }
        }
        console.log(allCategoryID)
        const all_products = allCategoryID.length > 0
            ? await ProductModel.find({ ProductType: ProductType, Deleted: false, CategoryID: { $in: allCategoryID } })
            : await ProductModel.find({ ProductType: ProductType, Deleted: false })

        const all_author_id = all_products.map(product => product.AuthorID)
        const all_authors = await AuthorModel.find({ AuthorID: { $in: all_author_id } })

        const all_publisher_id = all_products.map(product => product.PublicationID)
        const all_publishers = await PublicationModel.find({ PublicationID: { $in: all_publisher_id } }, 'PublicationID PublicationName PublicationNameBN PublicationSlug')

        const all_brand_id = all_products.map(product => product.BrandID)
        const all_brands = await BrandModel.find({ BrandID: { $in: all_brand_id } })

        res.status(200).json(
            {
                status: 200,
                products: data,
                categories: categories,
                authors: all_authors,
                publishers: all_publishers,
                brands: all_brands,
                breadcrumb_data: breadcrumbs
            })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})

router.get('/product_filter', async (req, res) => {
    try {
        let { page = 1, limit = 10, SortBy, status = 'ALL' } = req.query;
        const Subcategories = req.query?.Subcategories?.split(',')
        const subcategory_array = Subcategories?.length > 0 ? Subcategories : []
        const Authors = req.query?.Authors?.split(',')
        const author_array = Authors?.length > 0 ? Authors : []
        const Publications = req.query?.Publications?.split(',')
        const publication_array = Publications?.length > 0 ? Publications : []
        let products;

        if (subcategory_array.length > 0 && author_array.length > 0 && publication_array.length > 0) {
            products = await ProductModel.find(
                {
                    ...req.query,
                    Deleted: false,
                    AuthorID: {
                        $in: author_array
                    },
                    PublicationID: {
                        $in: publication_array
                    },
                    CategoryID: {
                        $in: subcategory_array
                    },
                    // availabality
                    UnitInStock: status === 'AVAILABILITY' ? { $gt: 0 } : status === "UNAVAILABILITY" ? 0 : { $gt: -1 }
                })
                .limit(limit)
                .skip((page - 1) * limit)
                .sort(SortBy === "LOW_TO_HIGH"
                    ? { SalePrice: 1 }
                    : SortBy === "HIGH_TO_LOW"
                        ? { SalePrice: -1 }
                        : { Sold: -1 })

        } else if (subcategory_array.length > 0 && author_array.length > 0) {
            products = await ProductModel.find(
                {
                    ...req.query,
                    Deleted: false,
                    AuthorID: {
                        $in: author_array
                    },
                    CategoryID: {
                        $in: subcategory_array
                    },
                    UnitInStock: status === 'AVAILABILITY' ? { $gt: 0 } : status === "UNAVAILABILITY" ? 0 : { $gt: -1 }

                })
                .limit(limit)
                .skip((page - 1) * limit)
                .sort(SortBy === "LOW_TO_HIGH"
                    ? { SalePrice: 1 }
                    : SortBy === "HIGH_TO_LOW"
                        ? { SalePrice: -1 }
                        : { Sold: -1 })
        } else if (subcategory_array.length > 0 && publication_array.length > 0) {
            products = await ProductModel.find(
                {
                    ...req.query,
                    Deleted: false,
                    PublicationID: {
                        $in: publication_array
                    },
                    CategoryID: {
                        $in: subcategory_array
                    },
                    UnitInStock: status === 'AVAILABILITY' ? { $gt: 0 } : status === "UNAVAILABILITY" ? 0 : { $gt: -1 }
                })
                .limit(limit)
                .skip((page - 1) * limit)
                .sort(SortBy === "LOW_TO_HIGH"
                    ? { SalePrice: 1 }
                    : SortBy === "HIGH_TO_LOW"
                        ? { SalePrice: -1 }
                        : { Sold: -1 })
        } else if (author_array.length > 0 && publication_array.length > 0) {

            products = await ProductModel.find(
                {
                    ...req.query,
                    Deleted: false,
                    AuthorID: {
                        $in: author_array
                    },
                    PublicationID: {
                        $in: publication_array
                    },
                    UnitInStock: status === 'AVAILABILITY' ? { $gt: 0 } : status === "UNAVAILABILITY" ? 0 : { $gt: -1 }
                })
                .limit(limit)
                .skip((page - 1) * limit)
                .sort(SortBy === "LOW_TO_HIGH"
                    ? { SalePrice: 1 }
                    : SortBy === "HIGH_TO_LOW"
                        ? { SalePrice: -1 }
                        : { Sold: -1 })

        } else if (publication_array?.length !== 0) {
            products = await ProductModel.find(
                {
                    ...req.query,
                    Deleted: false,
                    PublicationID: {
                        $in: publication_array
                    },
                    UnitInStock: status === 'AVAILABILITY' ? { $gt: 0 } : status === "UNAVAILABILITY" ? 0 : { $gt: -1 }
                })
                .limit(limit)
                .skip((page - 1) * limit)
                .sort(SortBy === "LOW_TO_HIGH"
                    ? { SalePrice: 1 }
                    : SortBy === "HIGH_TO_LOW"
                        ? { SalePrice: -1 }
                        : { Sold: -1 })

        } else if (author_array?.length !== 0) {
            products = await ProductModel.find(
                {
                    ...req.query,
                    Deleted: false,
                    AuthorID: {
                        $in: author_array
                    },
                    UnitInStock: status === 'AVAILABILITY' ? { $gt: 0 } : status === "UNAVAILABILITY" ? 0 : { $gt: -1 }
                })
                .limit(limit)
                .skip((page - 1) * limit)
                .sort(SortBy === "LOW_TO_HIGH"
                    ? { SalePrice: 1 }
                    : SortBy === "HIGH_TO_LOW"
                        ? { SalePrice: -1 }
                        : { Sold: -1 })

        } else if (subcategory_array.length !== 0) {
            products = await ProductModel.find(
                {
                    ...req.query,
                    Deleted: false,
                    SubCategoryID: {
                        $in: subcategory_array
                    },
                    UnitInStock: status === 'AVAILABILITY' ? { $gt: 0 } : status === "UNAVAILABILITY" ? 0 : { $gt: -1 }
                })
                .limit(limit)
                .skip((page - 1) * limit)
                .sort(SortBy === "LOW_TO_HIGH"
                    ? { SalePrice: 1 }
                    : SortBy === "HIGH_TO_LOW"
                        ? { SalePrice: -1 }
                        : { Sold: -1 })
        } else {
            products = await ProductModel.find(
                {
                    ...req.query,
                    Deleted: false,
                    UnitInStock: status === 'AVAILABILITY' ? { $gt: 0 } : status === "UNAVAILABILITY" ? 0 : { $gt: -1 }
                })
                .limit(limit)
                .skip((page - 1) * limit)
                .sort(SortBy === "LOW_TO_HIGH"
                    ? { SalePrice: 1 }
                    : SortBy === "HIGH_TO_LOW"
                        ? { SalePrice: -1 }
                        : { Sold: -1 })
        }
        res.status(200).json({ status: 200, products })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})

router.get('/home_page_product', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const products = await ProductModel.find({}).limit(limit).skip((page - 1) * limit)

        res.status(200).json({ status: 200, products })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})

module.exports = router
