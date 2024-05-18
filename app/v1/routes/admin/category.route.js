const express = require("express");
const router = express();
// middleware
const { upload } = require("../../middlewares/multer");
// database models
const CategoryModel = require("../../models/category.model");
const { GenerateUniqueId } = require('../../utility/unique-id-generator')
const UploadToStorage = require("../../utility/file-upload");
const { ProductTypes, PERMS } = require("../../constant");
const deleteFile = require("../../utility/delete-file");

const HasPerm = (req, res, next) => {
  try {
    /// check if same element exist in 2 arrays
    const hasPerm = req?.admin.Permissions?.some((item) =>
      PERMS.CATEGORY_MANAGE_PERMISSIONS.includes(item)
    );
    if (hasPerm) {
      console.log("HasPerm");
      next();
    } else
      res.status(400).json({
        success: false,
        message: "Access Denied",
      });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/admin/category/:
 *  post:
 *    tags: [admin-category]
 *    description:  add new category
 *    parameters:
 *      - in: formData
 *        name: CategoryName
 *      - in: formData
 *        name: ProductType
 *      - in: formData
 *        name: ParentCategoryID
 *      - in: formData
 *        name: CategoryBanner
 *        type: file
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.post("/", HasPerm, upload.none(), async (req, res) => {
  try {
    const { CategoryName, ProductType, ParentCategoryID = 0 } = req.body;

    if (!ProductTypes.includes(ProductType)) {
      throw new Error("ProductType not found");
    }

    if (!CategoryName || !ProductType) {
      return res
        .status(400)
        .json({ message: "CategoryName and ProductType are required" });
    }

    const parent =
      ParentCategoryID == 0
        ? { CategoryID: "0" }
        : await CategoryModel.findOne({ CategoryID: ParentCategoryID });
    if (!parent?.CategoryID) {
      return res.status(400).json({ message: "Parent category not found" });
    }

    const Pic = req.body.CategoryBanner;
    const CategorySequence = GenerateUniqueId()

    const CategorySlug =
      CategoryName.toLowerCase().replace(/ /g, "-") +
      "-" +
      Math.floor(Math.random() * 10000);

    const new_category = await CategoryModel.create({
      CategoryID: CategorySequence,
      ParentCategoryID: parent.CategoryID,
      CategoryName,
      CategorySlug,
      ProductType,
      CategoryBanner: Pic,
    });

    res
      .status(200)
      .json({
        message: "Category created successfully",
        category: new_category,
      });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/category/edit:
 *  post:
 *    tags: [admin-category]
 *    description:  edit category
 *    parameters:
 *      - in: formData
 *        name: CategoryName
 *      - in: formData
 *        name: CategoryID
 *      - in: formData
 *        name: ParentCategoryID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.post("/edit", upload.none(), HasPerm, async (req, res) => {
  try {
    const { CategoryID, CategoryName, ParentCategoryID } = req.body;
    console.log(req.body);
    const category = await CategoryModel.findOne({ CategoryID });
    if (!category?.CategoryID) {
      return res.status(400).json({ message: "Category not found" });
    }

    const data = {
      CategoryName: CategoryName ? CategoryName : category.CategoryName,
      ParentCategoryID: ParentCategoryID
        ? ParentCategoryID
        : category.ParentCategoryID,
    };

    if (req.body.CategoryBanner && req.body.CategoryBanner != category.CategoryBanner) {
      data.CategoryBanner = req.body.CategoryBanner
      await deleteFile(category.CategoryBanner)
    }

    const updated_category = await CategoryModel.findOneAndUpdate(
      { CategoryID },
      data,
      { new: true }
    );
    res
      .status(200)
      .json({
        message: "Category updated successfully",
        category: updated_category,
      });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/category/{CategoryID}:
 *  delete:
 *    tags: [admin-category]
 *    description:  delete category
 *    parameters:
 *      - in: path
 *        name: CategoryID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.delete("/:CategoryID", HasPerm, async (req, res) => {
  try {
    const { CategoryID } = req.params;

    const category = await CategoryModel.findOne({ CategoryID });
    if (!category?.CategoryID) {
      return res.status(400).json({ message: "Category not found" });
    }

    await CategoryModel.findOneAndDelete({ CategoryID });
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (e) {
    console.log(e);
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/category/jonopriyo_category:
 *  get:
 *    tags: [admin-category]
 *    description:  jonopriyo category
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.get("/jonopriyo_category", HasPerm, async (req, res) => {
  try {
    const categories = await CategoryModel.find({ ParentCategoryID: "0" });
    res.status(200).json({ categories });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/category/toggle-popular:
 *  patch:
 *    tags: [admin-category]
 *    description:  toggle popular category
 *    parameters:
 *      - in: formData
 *        name: CategoryID
 *      - in: formData
 *        name: popular
 *        type: boolean
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.patch("/toggle-popular", HasPerm, upload.none(), async (req, res) => {
  try {
    const { CategoryID, popular } = req.body;
    const category = await CategoryModel.findOne({ CategoryID });
    if (!category?.CategoryID) {
      return res.status(400).json({ message: "Category not found" });
    }

    const updated_category = await CategoryModel.findOneAndUpdate(
      { CategoryID },
      { Popular: popular },
      { new: true }
    );
    res
      .status(200)
      .json({
        message: "Category updated successfully",
        category: updated_category,
      });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

module.exports = router;
