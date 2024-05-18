const express = require("express");
const router = express();
const { upload } = require("../../middlewares/multer");
const HigherEduModel = require("../../models/higher-edu-model");
const { GenerateUniqueId } = require("../../utility/unique-id-generator");
const AdminLogModel = require("../../models/admin-log.model");
const UploadFile = require("../../utility/file-upload");
const UploadToStorage = require("../../utility/file-upload");
const deleteFile = require("../../utility/delete-file");
const fs = require("fs");
const { PERMS } = require('../../constant')

const HasPerm = (req, res, next) => {
  try {
    /// check if same element exist in 2 arrays
    const hasPerm = req?.admin.Permissions?.some((item) => PERMS.SPECIAL_EXTRA_MANAGE_PERMISSION.includes(item));
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
 * /api/v1/admin/higher-edu/new:
 *  post:
 *    tags: [admin-higher-edu]
 *    description: add new higher education
 *    parameters:
 *      - in: formData
 *        name: InstituteName
 *      - in: formData
 *        name: ShortDesc
 *      - in: formData
 *        name: Details
 *      - in: formData
 *        name: RankNo
 *      - in: formData
 *        name: Country
 *      - in: formData
 *        name: Logo
 *        type: file
 *      - in: formData
 *        name: Picture
 *        type: file
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post(
  "/new",
  HasPerm,
  upload.fields([
    { name: "Logo", maxCount: 1 },
    { name: "Picture", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { Logo, Picture } = req.files;
      const { InstituteName, ShortDesc, Details, RankNo, Country } = req.body;
      const InstituteSlug = InstituteName.replaceAll(" ", "-");
      const LogoUrl = await UploadFile(Logo[0]?.path);
      const PictureUrl = await UploadFile(Picture[0]?.path);
      const InstituteID = GenerateUniqueId()

      const newHigherEdu = await HigherEduModel.create({
        InstituteName,
        ShortDesc,
        Details,
        RankNo,
        Country,
        Logo: LogoUrl[0]?.metadata?.mediaLink,
        Picture: PictureUrl[0]?.metadata?.mediaLink,
        InstituteSlug,
        InstituteID: InstituteID,
      });

      // admins action log
      const admin_action = `Inistiture Added: ${InstituteName}`;
      const admin_act_desc = ``
      const admin_username = req.decodedToken.username
      await AdminLogModel.create({ username: admin_username, action: admin_action, action_desc: admin_act_desc })


      res.status(200).json({
        status: 200,
        message: "New Higher Education Created",
        data: newHigherEdu,
      });
      fs.unlinkSync(Logo[0]?.path);
      fs.unlinkSync(Picture[0]?.path);
    } catch (e) {
      res.status(400).json({ status: 400, message: e.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/admin/higher-edu/edit:
 *  post:
 *    tags: [admin-higher-edu]
 *    description: edit higher education
 *    parameters:
 *      - in: formData
 *        name: InstituteID
 *      - in: formData
 *        name: InstituteName
 *      - in: formData
 *        name: ShortDesc
 *      - in: formData
 *        name: Details
 *      - in: formData
 *        name: RankNo
 *      - in: formData
 *        name: Country
 *      - in: formData
 *        name: Logo
 *        type: file
 *      - in: formData
 *        name: Picture
 *        type: file
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post(
  "/edit",
  HasPerm,
  upload.fields([
    { name: "Logo", maxCount: 1 },
    { name: "Picture", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { InstituteID } = req.body;

      const logoData =
        req.files.Logo && (await UploadToStorage(req?.files?.Logo[0]?.path));
      const pictureData =
        req.files.Picture &&
        (await UploadToStorage(req?.files?.Picture[0]?.path));
      console.log(logoData);
      const editHigherEdu = await HigherEduModel.findOneAndUpdate(
        { InstituteID },
        {
          ...req.body,
          ...(req.files.Logo
            ? { Logo: logoData[0].metadata.mediaLink }
            : { Logo: "" }),
          ...(req.files.Picture
            ? {
              Picture: pictureData[0].metadata.mediaLink,
            }
            : { Picture: "" }),
        },
        { new: true }
      );
      req?.files?.Logo && fs.unlinkSync(req?.files?.Logo[0]?.path);
      req?.files?.Picture && fs.unlinkSync(req?.files?.Picture[0]?.path);

      // admins action log
      const admin_action = `Inistitute Edited: ${editHigherEdu?.InstituteName}`;
      const admin_act_desc = ``
      const admin_username = req.decodedToken.username
      await AdminLogModel.create({ username: admin_username, action: admin_action, action_desc: admin_act_desc })


      res.status(200).json({
        status: 200,
        message: "Higher Education Edited",
        data: editHigherEdu,
      });
    } catch (e) {
      req?.files?.Logo && fs.unlinkSync(req?.files?.Logo[0]?.path);
      req?.files?.Picture && fs.unlinkSync(req?.files?.Picture[0]?.path);
      res.status(400).json({ status: 400, message: e.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/admin/higher-edu/delete:
 *  post:
 *    tags: [admin-higher-edu]
 *    description: edit higher education
 *    parameters:
 *      - in: query
 *        name: InstituteID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post("/delete", HasPerm, upload.none(), async (req, res) => {
  try {
    const { InstituteID } = req.query;

    const higherEduData = await HigherEduModel.findOne({ InstituteID });

    if (!higherEduData.InstituteID) {
      res.status(400).json({ status: 400, message: "Institute Doesnot exist" });
      return;
    }

    await HigherEduModel.deleteOne({ InstituteID });
    await deleteFile(higherEduData?.Logo);
    await deleteFile(higherEduData?.Picture);

    res
      .status(200)
      .json({ status: 200, message: "Institute Deleted Successfully" });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

module.exports = router;
