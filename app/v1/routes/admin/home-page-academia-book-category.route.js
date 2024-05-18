const express = require("express");
const router = express();
const HomeAcademiaModel = require("../../models/home-page-academia-book-category.model");
const { upload } = require("../../middlewares/multer");
const UploadToStorage = require("../../utility/file-upload");
const deleteFile = require("../../utility/delete-file");
const { PERMS } = require("../../constant");

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
 * /api/v1/admin/home-page-academia-book-category/:
 *  post:
 *    tags: [admin-home-page-academia-book-category]
 *    description: edit higher education
 *    parameters:
 *      - in: formData
 *        name: AcademicIcon
 *        type: file
 *      - in: formData
 *        name: CategoryID
 *      - in: formData
 *        name: ShortDesc
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.post("/", HasPerm, upload.none(), async (req, res) => {
  try {
    const { CategoryID, ShortDesc } = req.body;
    const home_academia = await HomeAcademiaModel.findOne({ CategoryID });
    if (home_academia?.CategoryID) {
      return res.status(400).json({ message: "Category already added" });
    }
    const AcademicIcon = req.body.AcademicIcon
    const new_home_academia = await HomeAcademiaModel.create({
      CategoryID,
      IconURL: AcademicIcon,
      ShortDesc,
    });
    res.status(200).json({
      message: "Category added successfully",
      home_academia: new_home_academia,
    });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/home-page-academia-book-category/{CategoryID}:
 *  delete:
 *    tags: [admin-home-page-academia-book-category]
 *    description: edit higher education
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
    const category = await HomeAcademiaModel.findOne({ CategoryID });
    if (!category?.CategoryID) {
      return res.status(400).json({ message: "Category not found" });
    }

    const home_academia = await HomeAcademiaModel.findOneAndDelete({
      CategoryID,
    });
    await deleteFile(category.IconURL);
    res.status(200).json({ home_academia });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/home-page-academia-book-category:
 *  patch:
 *    tags: [admin-home-page-academia-book-category]
 *    description: edit home page academia book category
 *    parameters:
 *      - in: formData
 *        name: CategoryID
 *      - in: formData
 *        name: ShortDesc
 *      - in: formData
 *        name: AcademicIcon
 *        type: file
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.patch("/", HasPerm, upload.none(), async (req, res) => {
  try {
    const { CategoryID, ShortDesc } = req.body;
    const category = await HomeAcademiaModel.findOne({ CategoryID });
    if (!category?.CategoryID) {
      return res.status(400).json({ message: "Category not found" });
    }

    const newData = {
      ShortDesc: ShortDesc
    }

    const AcademicIcon = req.body.AcademicIcon
    if (AcademicIcon && AcademicIcon !== category.IconURL) {
      newData.IconURL = AcademicIcon;
      await deleteFile(category.IconURL);
    }

    const updated_category = await HomeAcademiaModel.findOneAndUpdate(
      { CategoryID },
      newData,
      { new: true }
    );
    res.status(200).json({
      message: "Category updated successfully",
      home_academia: updated_category,
    });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

module.exports = router;
