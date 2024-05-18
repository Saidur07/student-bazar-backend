const express = require("express");
const { upload } = require("../../middlewares/multer");
const AuthorModel = require("../../models/author.model");
const CategoryModel = require("../../models/category.model");
const ProductsModel = require("../../models/product.model");
const PublicationModel = require("../../models/publication.model");
const router = express();

const getChildCategories = async (categoryID) => {
  const categories = await CategoryModel.find({ ParentCategoryID: categoryID }, 'CategoryID ParentCategoryID CategoryName CategorySlug')
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
 * /api/v1/public/publication/all:
 *  get:
 *    tags: [public-publication]
 *    description: get all publications
 *    parameters:
 *      - in: query
 *        name: limit
 *      - in: query
 *        name: page
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.get("/all", upload.none(), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const all_publication = await PublicationModel.find({})
      .limit(Number(limit))
      .skip(Number(limit) * (Number(page) - 1));
    res.status(200).json({ status: 200, publications: all_publication });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/public/publication/publication_details:
 *  get:
 *    tags: [public-publication]
 *    description: get publication details
 *    parameters:
 *      - in: query
 *        name: PublicatonID
 *      - in: query
 *        name: PublicationSlug
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */

router.get("/publication_details", upload.none(), async (req, res) => {
  try {
    const publication_details = await PublicationModel.findOne(req?.query);
    const products = await ProductsModel.find({ PublicationID: publication_details?.PublicationID }, 'AuthorID CategoryID')
    let author_id_array = []
    products.map(product => !(author_id_array.includes(product.AuthorID)) && author_id_array.push(product.AuthorID))
    const authors = await AuthorModel.find({ AuthorID: { $in: author_id_array } }, 'AuthorID AuthorName AuthorNameBN AuthorSlug')

    const categoryIDList = products.map(product => product.CategoryID)
    const categoryID = [].concat(...categoryIDList)
    let all_category_under_publication = await CategoryModel.find({ CategoryID: { $in: categoryID } })

    const all_categories_with_child = await Promise.all(
      all_category_under_publication.map(async (category) => {
        const childCategories = await getChildCategories(category.CategoryID)

        return {
          ...category.toJSON(),
          childCategories,
        }
      })
    )

    res.status(200).json({
      status: 200,
      publication: publication_details,
      authors,
      categories: all_categories_with_child,
    });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

router.get("/filter-publication", upload.none(), async (req, res) => {
  try {

    /*** NEED TO FIX OR DELETE ***/
    const { PublicationID = [], page = 1, limit = 10, SortBy } = req.query;
    const publication_array = PublicationID.length > 0 ? PublicationID.split(",") : [];
    const results = await ProductsModel.find(
      {
        PublicationID: { $in: publication_array },
        Deleted: false,
      }
    )
      .limit(limit)
      .skip((page - 1) * limit)
      .sort(
        SortBy ? SortBy === "LOW_TO_HIGH"
          ? { SalePrice: 1 }
          : SortBy === "HIGH_TO_LOW"
            ? { SalePrice: -1 }
            : { Sold: -1 } : {}
      );


    res.status(200).json({ status: 200, Products: results })
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
})
module.exports = router;
