const express = require("express");
const CommonInfoModel = require("../../models/common-info.model");
const AdminLogModel = require("../../models/admin-log.model");
const UploadToStorage = require("../../utility/file-upload");
const { upload } = require("../../middlewares/multer");
const fs = require("fs");
const router = express();
const { PERMS } = require('../../constant')


const HasPerm = (req, res, next) => {
  try {
    /// check if same element exist in 2 arrays
    const hasPerm = req?.admin.Permissions?.some((item) => PERMS.SETTINGS_MANAGE_PERMISSION.includes(item));
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
 * /api/v1/admin/commoninfo/update_logo:
 *  post:
 *    tags: [admin-commoninfo]
 *    description: update logo
 *    parameters:
 *      - in: formData
 *        name: AttributeName
 *      - in: formData
 *        name: update_logo
 *        type: file
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post(
  "/update_logo",
  HasPerm,
  upload.single("AttributeValue"),
  async (req, res) => {
    try {
      const { AttributeName } = req.body;
      const fileData = await UploadToStorage(req.file.path);
      const updatedAttribute = await CommonInfoModel.findOneAndUpdate(
        { AttributeName: AttributeName },
        {
          $set: {
            AttributeValue: fileData[0].metadata.mediaLink,
          },
        },
        {
          new: true,
          upsert: true,
        }
      );

      // admins action log
      const admin_action = `Logo Updated`;
      const admin_act_desc = ``;
      const admin_username = req.decodedToken.username;
      await AdminLogModel.create({
        username: admin_username,
        action: admin_action,
        action_desc: admin_act_desc,
      });

      fs.unlinkSync(req.file.path);
      res.status(200).json({ status: 200, attribute: updatedAttribute });
    } catch (e) {
      fs.unlinkSync(req.file.path);
      res.status(400).json({ status: 400, message: e.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/admin/commoninfo/update_site_details:
 *  post:
 *    tags: [admin-commoninfo]
 *    description: update site details
 *    parameters:
 *      - in: formData
 *        name: SiteTitle
 *      - in: formData
 *        name: SiteDescription
 *      - in: formData
 *        name: MaintainenceMode
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post(
  "/update_site_details",
  upload.none(),
  HasPerm,
  async (req, res) => {
    try {
      const attributes = await CommonInfoModel.findOne({ AttributeName: "SiteDetails" })
      const updatedAttribute = await CommonInfoModel.findOneAndUpdate(
        { AttributeName: "SiteDetails" },
        {
          AttributeValue: {
            ...attributes.AttributeValue,
            ...req.body,
            MaintainenceMode: typeof req.body.MaintainenceMode === "string" ? JSON.parse(req.body.MaintainenceMode) : typeof req.body.MaintainenceMode === "boolean" ? req.body.MaintainenceMode : false
          }
        },
        {
          new: true,
          upsert: true,
        }
      );

      // admins action log
      const admin_action = `Site Deatils Updated`;
      const admin_act_desc = ``;
      const admin_username = req.decodedToken.username;
      await AdminLogModel.create({
        username: admin_username,
        action: admin_action,
        action_desc: admin_act_desc,
      });

      res.status(200).json({ status: 200, attribute: updatedAttribute });
    } catch (e) {
      res.status(400).json({ status: 400, message: e.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/admin/commoninfo/update-terms-condition:
 *  post:
 *    tags: [admin-commoninfo]
 *    description: update terms and condition
 *    parameters:
 *      - in: formData
 *        name: UpdatedText
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post("/update-terms-condition", HasPerm, upload.none(), async (req, res) => {
  try {
    const { UpdatedText } = req.body;
    const updatedAttribute = await CommonInfoModel.findOneAndUpdate(
      {
        AttributeName: "TermsCondition",
      },
      {
        AttributeValue: UpdatedText,
      },
      {
        new: true,
        upsert: true,
      }
    );

    // admins action log
    const admin_action = `Terms & Conditon updated`;
    const admin_act_desc = ``;
    const admin_username = req.decodedToken.username;
    await AdminLogModel.create({
      username: admin_username,
      action: admin_action,
      action_desc: admin_act_desc,
    });

    res.status(200).json({ status: 200, data: updatedAttribute });
  } catch (e) {
    res.status(400).json(e.message);
  }
});

/**
 * @swagger
 * /api/v1/admin/commoninfo/update-privacy-policy:
 *  post:
 *    tags: [admin-commoninfo]
 *    description: update terms and condition
 *    parameters:
 *      - in: formData
 *        name: UpdatedText
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post("/update-privacy-policy", HasPerm, upload.none(), async (req, res) => {
  try {
    const { UpdatedText } = req.body;
    const updatedAttribute = await CommonInfoModel.findOneAndUpdate(
      {
        AttributeName: "PrivacyPolicy",
      },
      {
        AttributeValue: UpdatedText,
      },
      {
        new: true,
        upsert: true,
      }
    );

    // admins action log
    const admin_action = `Privacy Policy updated`;
    const admin_act_desc = ``;
    const admin_username = req.decodedToken.username;
    await AdminLogModel.create({
      username: admin_username,
      action: admin_action,
      action_desc: admin_act_desc,
    });

    res.status(200).json({ status: 200, data: updatedAttribute });
  } catch (e) {
    res.status(400).json(e.message);
  }
});

/**
 * @swagger
 * /api/v1/admin/commoninfo/update-return-policy:
 *  post:
 *    tags: [admin-commoninfo]
 *    description: update terms and condition
 *    parameters:
 *      - in: formData
 *        name: UpdatedText
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post("/update-return-policy", HasPerm, upload.none(), async (req, res) => {
  try {
    const { UpdatedText } = req.body;
    const updatedAttribute = await CommonInfoModel.findOneAndUpdate(
      {
        AttributeName: "ReturnPolicy",
      },
      {
        AttributeValue: UpdatedText,
      },
      {
        new: true,
        upsert: true,
      }
    );

    // admins action log
    const admin_action = `Return Policy updated`;
    const admin_act_desc = ``;
    const admin_username = req.decodedToken.username;
    await AdminLogModel.create({
      username: admin_username,
      action: admin_action,
      action_desc: admin_act_desc,
    });

    res.status(200).json({ status: 200, data: updatedAttribute });
  } catch (e) {
    res.status(400).json(e.message);
  }
});



/**
 * @swagger
 * /api/v1/admin/commoninfo/UpdateSocialLinks:
 *  patch:
 *    tags: [admin-commoninfo]
 *    description: update social links
 *    parameters:
 *      - in: formData
 *        name: Facebook
 *      - in: formData
 *        name: Twitter
 *      - in: formData
 *        name: Instagram
 *      - in: formData
 *        name: Youtube
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.patch('/UpdateSocialLinks', HasPerm, upload.none(), async (req, res) => {
  try {
    const { Facebook, Instagram, Twitter, Youtube } = req.body;

    const socialLinks = await CommonInfoModel.findOne({ AttributeName: 'SocialLinks' });

    const updatedAttribute = await CommonInfoModel.findOneAndUpdate(
      {
        AttributeName: "SocialLinks",
      },
      {
        AttributeValue: {
          Facebook: Facebook ? Facebook : socialLinks.AttributeValue.Facebook,
          Instagram: Instagram ? Instagram : socialLinks.AttributeValue.Instagram,
          Twitter: Twitter ? Twitter : socialLinks.AttributeValue.Twitter,
          Youtube: Youtube ? Youtube : socialLinks.AttributeValue.Youtube
        },
      },
      {
        new: true
      }
    );

    // admins action log
    const admin_action = `Social Links updated`;
    const admin_act_desc = ``;
    const admin_username = req.decodedToken.username;
    await AdminLogModel.create({
      username: admin_username,
      action: admin_action,
      action_desc: admin_act_desc,
    });

    res.status(200).json({ status: 200, data: updatedAttribute });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message })
  }
})


/**
 * @swagger
 * /api/v1/admin/commoninfo/UpdateAttribute:
 *  patch:
 *    tags: [admin-commoninfo]
 *    description: update attribute
 *    parameters:
 *      - in: formData
 *        name: AttributeName
 *      - in: formData
 *        name: AttributeValue
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.patch('/UpdateAttribute', HasPerm, upload.none(), async (req, res) => {
  try {
    const { AttributeName, AttributeValue } = req.body;

    const updatedAttribute = await CommonInfoModel.findOneAndUpdate(
      {
        AttributeName: AttributeName,
      },
      {
        AttributeName: AttributeName,
        AttributeValue: AttributeValue,
      },
      {
        new: true,
        upsert: true,
      }
    );

    // admins action log
    const admin_action = `${AttributeName} updated`;
    const admin_act_desc = ``;
    const admin_username = req.decodedToken.username;
    await AdminLogModel.create({
      username: admin_username,
      action: admin_action,
      action_desc: admin_act_desc,
    });

    res.status(200).json({ status: 200, data: updatedAttribute });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

module.exports = router;
