const express = require("express");
const router = express();
const { upload } = require("../../middlewares/multer");
const AdminLogModel = require("../../models/admin-log.model");
const AttributeModel = require("../../models/attributes.model");
const { PERMS } = require("../../constant");

const HasPerm = (req, res, next) => {
  try {
    /// check if same element exist in 2 arrays
    const hasPerm = req?.admin.Permissions?.some((item) => PERMS.PRODUCT_MANAGE_PERMISSIONS.includes(item));
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
 * /api/v1/admin/attribute/new:
 *  post:
 *    tags: [admin-attribute]
 *    description: create attribute
 *    parameters:
 *      - in: formData
 *        name: AttributeName
 *      - in: formData
 *        name: AttributeDesc
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */

router.post("/new", HasPerm, upload.none(), async (req, res) => {
  try {
    const { AttributeName, AttributeDesc } = req.body;

    const exists = await AttributeModel.findOne({ AttributeName });
    if (exists?.AttributeName) {
      throw new Error("Attribute already exists");
    }

    const data = await AttributeModel.create({
      AttributeName,
      AttributeDesc,
    });

    const admin_action = "Added New Attribute: " + AttributeName;
    const admin_act_desc = "";
    await AdminLogModel.create({
      username: req.decodedToken.username,
      action: admin_action,
      action_desc: admin_act_desc,
    });

    res.status(200).json({ status: 200, attribute: data });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/attribute/edit:
 *  post:
 *    tags: [admin-attribute]
 *    description: edit attribute
 *    parameters:
 *      - in: formData
 *        name: AttributeName
 *      - in: formData
 *        name: NewAttributeName
 *      - in: formData
 *        name: NewAttributeDesc
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post("/edit", HasPerm, upload.none(), async (req, res) => {
  try {
    const { AttributeName, NewAttributeName, NewAttributeDesc } = req.body;

    const updated_data = {
      AttributeName: NewAttributeName && NewAttributeName,
      AttributeDesc: NewAttributeDesc && NewAttributeDesc,
    };

    const data = await AttributeModel.findOneAndUpdate(
      {
        AttributeName,
      },
      updated_data,
      { new: true }
    );

    const admin_action = "Updated Attribute: " + AttributeName + " to " + NewAttributeName;
    const admin_act_desc = "";
    await AdminLogModel.create({
      username: req.decodedToken.username,
      action: admin_action,
      action_desc: admin_act_desc,
    });

    res.status(200).json({ status: 200, attribute: data });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/attribute/delete:
 *  delete:
 *    tags: [admin-attribute]
 *    description: delete attribute
 *    parameters:
 *      - in: query
 *        name: AttributeName
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.delete("/delete", HasPerm, upload.none(), async (req, res) => {
  try {
    const { AttributeName } = req.query;

    if (!AttributeName) {
      throw new Error("AttributeName is required");
    }

    await AttributeModel.findOneAndDelete({ AttributeName });
    const admin_action = "Deleted Attribute: " + AttributeName;
    const admin_act_desc = "";
    await AdminLogModel.create({
      username: req.decodedToken.username,
      action: admin_action,
      action_desc: admin_act_desc,
    });

    res.status(200).json({ status: 200, message: "Attribute deleted" });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});



/**
 * @swagger
 * /api/v1/admin/attribute/:
 *  get:
 *    tags: [admin-attribute]
 *    description: get all attribute
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.get("/", HasPerm, async (req, res) => {
  try {
    const all_attributes = await AttributeModel.find({});
    res.status(200).json({ status: 200, attributes: all_attributes });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

module.exports = router;
