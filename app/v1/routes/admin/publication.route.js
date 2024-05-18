const express = require("express");
const router = express();
const { upload } = require("../../middlewares/multer");
const UploadToStorage = require("../../utility/file-upload");
const PublicationModel = require("../../models/publication.model");
const { GenerateUniqueId } = require('../../utility/unique-id-generator')
const AdminLogModel = require("../../models/admin-log.model");
const deleteFile = require("../../utility/delete-file");
const fs = require('fs')
const { PERMS } = require('../../constant')

const HasPerm = (req, res, next) => {
  try {
    /// check if same element exist in 2 arrays
    const hasPerm = req?.admin.Permissions?.some((item) => PERMS.CATEGORY_MANAGE_PERMISSIONS.includes(item));
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
 * /api/v1/admin/publication/add_new:
 *  post:
 *    tags: [admin-publication]
 *    description: edit product
 *    parameters:
 *      - in: formData
 *        name: PublicationName
 *      - in: formData
 *        name: PublicationNameBN
 *      - in: formData
 *        name: PublicationDesc
 *      - in: formData
 *        name: PublicationPhoto
 *        type: file
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post("/add_new", HasPerm, upload.none(), async (req, res) => {
  try {
    const uploadedFile = req.body.PublicationPhoto
    const Seq = GenerateUniqueId()

    const new_publication = await PublicationModel.create({
      ...req.body,
      PublicationID: Seq,
      PublicationPhoto: uploadedFile,
      PublicationSlug: req.body.PublicationName
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, ""),
    });

    // admins action log
    const admin_action = `New Publication: ${new_publication.PublicationName}`;
    const admin_act_desc = `PublicationID: ${Seq}`;
    const admin_username = req.decodedToken.username;
    await AdminLogModel.create({
      username: admin_username,
      action: admin_action,
      action_desc: admin_act_desc,
    });

    res.status(200).json({ status: 200, publication: new_publication });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/publication/edit:
 *  post:
 *    tags: [admin-publication]
 *    description: edit product
 *    parameters:
 *      - in: formData
 *        name: PublicationID
 *      - in: formData
 *        name: PublicationName
 *      - in: formData
 *        name: PublicationNameBN
 *      - in: formData
 *        name: PublicationDesc
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post("/edit", HasPerm, upload.none(), async (req, res) => {
  try {
    const { PublicationID } = req.body;

    const publication = await PublicationModel.findOne({
      PublicationID: req.body.PublicationID,
    });

    const newData = {
      ...req.body,
    }

    if (req.body.PublicationPhoto && req.body.PublicationPhoto !== publication.PublicationPhoto) {
      newData.PublicationPhoto = req.body.PublicationPhoto
      await deleteFile(publication.PublicationPhoto)
    }

    const data = await PublicationModel.findOneAndUpdate(
      { PublicationID },
      newData,
      { new: true }
    );

    // admins action log
    const admin_action = `Edit Publication: ${data.PublicationName}`;
    const admin_act_desc = `PublicationID: ${PublicationID}`;
    const admin_username = req.decodedToken.username;
    await AdminLogModel.create({
      username: admin_username,
      action: admin_action,
      action_desc: admin_act_desc,
    });

    if (req?.file?.path) {
      fs.unlinkSync(req?.file?.path);
    }
    res.status(200).json({ status: 200, publication: data });
  } catch (e) {
    if (req?.file?.path) {
      fs.unlinkSync(req?.file?.path);
    }
    res.status(400).json({ status: 400, message: e.message });
  }
});


/**
 * @swagger
 * /api/v1/admin/publication/delete/{PublicationID}:
 *  post:
 *    tags: [admin-publication]
 *    description: delete product
 *    parameters:
 *      - in: path
 *        name: PublicationID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post("/delete/:id", HasPerm, async (req, res) => {
  try {
    // Checking if this CategoryName already exists
    const exist = await PublicationModel.findOne({
      PublicationID: req.params.id,
    });
    if (!exist?.PublicationName) {
      res
        .status(400)
        .json({ status: 400, message: "Publication Doesnot exist" });
      return;
    }

    await PublicationModel.deleteOne({ PublicationID: req.params.id });
    await deleteFile(exist?.PublicationPhoto)

    // admins action log
    const admin_action = `Delete Publication: ${exist?.PublicationName}`;
    const admin_act_desc = `PublicationID: ${req.params.id}`;
    const admin_username = req.decodedToken.username;
    await AdminLogModel.create({
      username: admin_username,
      action: admin_action,
      action_desc: admin_act_desc,
    });

    res
      .status(200)
      .json({ status: 200, message: "Publication Deleted Successfully" });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});
module.exports = router;
