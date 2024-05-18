const express = require("express");
const router = express();
const { upload } = require("../../middlewares/multer");
const UploadToStorage = require("../../utility/file-upload");
const { GenerateUniqueId } = require('../../utility/unique-id-generator')
const BrandModal = require("../../models/brand.model");
const AdminLogModel = require("../../models/admin-log.model");
const deleteFile = require("../../utility/delete-file");
const fs = require("fs");
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
 * /api/v1/admin/brand/new:
 *  post:
 *    tags: [admin-brand]
 *    description: add new brand
 *    parameters:
 *      - in: formData
 *        name: BrandName
 *      - in: formData
 *        name: BrandDescription
 *      - in: formData
 *        name: BrandLogo
 *        type: file
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.post("/new", HasPerm, upload.none(), async (req, res) => {
  try {
    const { BrandName, BrandDescription } = req.body;
    const admin = req.decodedToken;
    const Logo = req.body.BrandLogo
    const ID = GenerateUniqueId();
    const BrandSlug = BrandName.replaceAll(" ", "-");

    const BrandData = {
      BrandID: ID,
      BrandName,
      BrandDescription,
      BrandLogo: Logo,
      BrandSlug,
    };

    const new_brand = await BrandModal.create(BrandData);

    // admins action log
    const admin_action = `New Brand added: ${BrandName}`;
    const admin_act_desc = `BrandID: ${new_brand.BrandID}`;
    await AdminLogModel.create({
      username: admin.username,
      action: admin_action,
      action_desc: admin_act_desc,
    });

    res.status(200).json({ status: 200, brand: new_brand });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/brand/edit:
 *  post:
 *    tags: [admin-brand]
 *    description: edit brand
 *    parameters:
 *      - in: formData
 *        name: BrandName
 *      - in: formData
 *        name: BrandDescription
 *      - in: formData
 *        name: BrandID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.post("/edit", HasPerm, upload.none(), async (req, res) => {
  try {
    const { BrandID, BrandName, BrandDescription } = req.body;
    const BrandData = {
      BrandID,
      BrandName,
      BrandDescription,
    };

    const currentData = await BrandModal.findOne({ BrandID });

    if (req.body?.BrandLogo && currentData?.BrandLogo !== req.body?.BrandLogo) {
      BrandData.BrandLogo = req.body?.BrandLogo;
      await deleteFile(currentData?.BrandLogo);
    }
    const updatedBrand = await BrandModal.findOneAndUpdate(
      { BrandID },
      BrandData,
      { new: true }
    );

    // admins action log
    const admin_action = `Brand Edited: ${BrandName}`;
    const admin_act_desc = `BrandID: ${BrandID}`;
    await AdminLogModel.create({
      username: req.decodedToken.username,
      action: admin_action,
      action_desc: admin_act_desc,
    });

    res.status(200).json({ status: 200, brand: updatedBrand });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/brand/delete:
 *  delete:
 *    tags: [admin-brand]
 *    description: delete brand
 *    parameters:
 *      - in: query
 *        name: BrandID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.delete("/delete", HasPerm, async (req, res) => {
  try {
    const { BrandID } = req.query;

    const brand = await BrandModal.findOne({ BrandID });

    if (!brand?.BrandID) {
      throw new Error("Brand not found");
    }

    const deletedBrand = await BrandModal.findOneAndDelete({ BrandID });
    await deleteFile(brand?.BrandLogo);

    // admins action log
    const admin_action = `Brand Deleted: ${deletedBrand.BrandName}`;
    const admin_act_desc = `BrandID: ${BrandID}`;
    const admin_username = req.decodedToken.username;
    await AdminLogModel.create({
      username: admin_username,
      action: admin_action,
      action_desc: admin_act_desc,
    });

    res.status(200).json({ status: 200, brand: deletedBrand });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

module.exports = router;
