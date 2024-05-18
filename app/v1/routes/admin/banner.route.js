const express = require("express");
const router = express();
const BannerModel = require("../../models/banner.model");
const UploadToStorage = require("../../utility/file-upload");
const { GenerateUniqueId } = require('../../utility/unique-id-generator')
const AdminLogModel = require("../../models/admin-log.model");
const { upload } = require("../../middlewares/multer");
const fs = require("fs");
const deleteFile = require("../../utility/delete-file");
const { PERMS } = require('../../constant')

const HasPerm = (req, res, next) => {
  try {
    /// check if same element exist in 2 arrays
    const hasPerm = req?.admin.Permissions?.some((item) => PERMS.ADMIN_MANAGE_PERMISSIONS.includes(item));
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
 * /api/v1/admin/banner/new:
 *  post:
 *    tags: [admin-banner]
 *    description: add new banner
 *    parameters:
 *      - in: formData
 *        name: BannerTitle
 *      - in: formData
 *        name: BannerLink
 *      - in: formData
 *        name: BannerImage
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
    const { BannerTitle, BannerLink, BannerImage } = req.body;
    const admin = req.decodedToken;

    if (!BannerTitle || !BannerLink || !BannerImage) {
      throw new Error("Banner Title, Banner Image & Banner Link required");
    }
    const imageURL = BannerImage
    const BannerSeq = GenerateUniqueId();

    const BannerData = {
      BannerID: BannerSeq,
      BannerTitle,
      BannerImage: imageURL,
      BannerLink,
    };

    const result = await BannerModel.create(BannerData);

    // admins action log
    const admin_action = `New Banner added`;
    const admin_act_desc = `BannerID: ${result.BannerID}`;
    await AdminLogModel.create({
      username: admin.username,
      action: admin_action,
      action_desc: admin_act_desc,
    });

    res.status(200).json({ status: 200, banner: result });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/banner/edit:
 *  post:
 *    tags: [admin-banner]
 *    description: edit banner
 *    parameters:
 *      - in: formData
 *        name: BannerID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.post("/edit", HasPerm, upload.none(), async (req, res) => {
  try {
    const { BannerID } = req.body;
    const admin = req.decodedToken;

    const updated_banner = await BannerModel.findOneAndUpdate(
      { BannerID },
      req.body,
      { new: true }
    );

    // admins action log
    const admin_action = `Banner Edited`;
    const admin_act_desc = `BannerID: ${updated_banner.BannerID}`;
    await AdminLogModel.create({
      username: admin.username,
      action: admin_action,
      action_desc: admin_act_desc,
    });

    res.status(200).json({ status: 200, banner: updated_banner });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/banner/delete/{BannerID}:
 *  delete:
 *    tags: [admin-banner]
 *    description: delete banner
 *    parameters:
 *      - in: path
 *        name: BannerID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.delete("/delete/:id", HasPerm, async (req, res) => {
  try {
    const { id } = req.params;
    const admin = req.decodedToken;

    const banner = await BannerModel.findOne({ BannerID: id });

    if (!banner) {
      res.status(400).json({ status: 400, message: "Banner Doesnot exist" });
      return;
    }

    const deleted = await BannerModel.deleteOne({ BannerID: id });
    await deleteFile(banner?.BannerImage);

    // admins action log
    const admin_action = `Banner Deleted`;
    const admin_act_desc = `BannerID: ${banner.BannerID}`;
    await AdminLogModel.create({
      username: admin.username,
      action: admin_action,
      action_desc: admin_act_desc,
    });

    if (deleted) {
      res
        .status(200)
        .json({ status: 200, message: "Banner deleted succesfully" });
    }
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/banner/home_page_banners:
 *  get:
 *    tags: [admin-banner]
 *    description: get home page banners
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.get("/home_page_banners", HasPerm, async (req, res) => {
  try {
    const banners = await BannerModel.find({});
    res.status(200).json({ status: 200, banners });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

module.exports = router;
