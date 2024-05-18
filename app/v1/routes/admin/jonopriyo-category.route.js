const express = require("express");
const router = express();
const JonopriyoBoiModel = require("../../models/jonopriyo-category.model");
const { PERMS } = require("../../constant");
const { upload } = require("../../middlewares/multer");
const CategoryModel = require("../../models/category.model");

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
      res.status(403).json({
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
 * /api/v1/admin/jonopriyo-category/:
 *  post:
 *    tags: [admin-jonopriyo-category]
 *    description: edit higher education
 *    parameters:
 *      - in: formData
 *        name: CategoryID
 *      - in: formData
 *        name: Title
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.post("/", HasPerm, upload.none(), async (req, res) => {
  try {
    const { CategoryID, Title } = req.body;

    const jonopriyo_category = await JonopriyoBoiModel.addCategory(
      CategoryID,
      Title
    );
    res.status(200).json({ jonopriyo_category });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/jonopriyo-category/{CategoryID}:
 *  delete:
 *    tags: [admin-jonopriyo-category]
 *    description: delete jonopriyo category
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
    const jonopriyo_category = await JonopriyoBoiModel.findOneAndDelete({
      CategoryID,
    });
    res.status(200).json({ jonopriyo_category });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/jonopriyo-category:
 *  patch:
 *    tags: [admin-jonopriyo-category]
 *    description: edit jonopriyo category
 *    parameters:
 *      - in: formData
 *        name: CategoryID
 *      - in: formData
 *        name: Title
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */

router.patch("/", HasPerm, upload.none(), async (req, res) => {
  try {
    const { CategoryID, Title } = req.body;
    const category = await JonopriyoBoiModel.findOne({ CategoryID });
    if (!category?.CategoryID) {
      return res.status(400).json({ message: "Category not found" });
    }

    const updated_category = await JonopriyoBoiModel.findOneAndUpdate(
      { CategoryID },
      { CategoryID: CategoryID, Title: Title },
      { new: true }
    );

    res.status(200).json({
      message: "Category updated successfully",
      category: updated_category,
    });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

module.exports = router;
