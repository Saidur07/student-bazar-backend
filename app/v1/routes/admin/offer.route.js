const express = require("express");
const router = express();
const OfferModal = require("../../models/offer.model");
const SequenceModal = require("../../models/id-sequence.model");
const AdminLogModel = require("../../models/admin-log.model");
const { upload } = require("../../middlewares/multer");
const deleteFile = require("../../utility/delete-file");
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
 * /api/v1/admin/offer/new:
 *  post:
 *    tags: [admin-offer]
 *    description: add new offer
 *    parameters:
 *      - in: formData
 *        name: OfferName
 *      - in: formData
 *        name: OfferDesc
 *      - in: formData
 *        name: DiscountPercent
 *      - in: formData
 *        name: OfferStartingDate
 *        type: date
 *      - in: formData
 *        name: OfferEndingDate
 *        type: date
 *      - in: formData
 *        name: OfferType
 *        type: enam
 *        enum: [CATEGORY, PRODUCT]
 *      - in: formData
 *        name: Categories
 *      - in: formData
 *        name: Products
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */

router.post("/new", HasPerm, upload.none(), async (req, res) => {
  try {
    const {
      OfferName,
      OfferDesc,
      DiscountPercent,
      OfferStartingDate,
      OfferEndingDate,
      OfferType,
      Categories,
      Products,
    } = req.body;

    if (
      !OfferName ||
      !OfferDesc ||
      !DiscountPercent ||
      !OfferStartingDate ||
      !OfferEndingDate ||
      !OfferType
    ) {
      throw new Error("Missing required fields");
    }

    switch (OfferType) {
      case "CATEGORY":
        if (!Categories || Categories?.length === 0) {
          throw new Error("Categories is required");
        }
        break;

      case "PRODUCT":
        if (!Products || Products?.length === 0) {
          throw new Error("Products is required");
        }
        break;

      default:
        throw new Error("Invalid Offer Type");
    }

    const OfferSeq = await SequenceModal.findOneAndUpdate(
      { SequencesName: "Offer" },
      { $inc: { SequenceCount: 1 } },
      { new: true, upsert: true }
    );

    const offer = await OfferModal.create({
      ...req.body,
      OfferID: OfferSeq.SequenceCount,
      Categories: Categories?.replaceAll(" ", "")?.split(","),
      Products: Products?.replaceAll(" ", "")?.split(","),
    });

    // admins action log
    const admin_action = `New Offer Created: ${OfferName}}`
    const admin_act_desc = `OfferID: ${OfferSeq.SequenceCount}`
    const admin_username = req.decodedToken.username
    await AdminLogModel.create({ username: admin_username, action: admin_action, action_desc: admin_act_desc })


    res.status(200).json({
      status: 200,
      offer: offer,
    });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});


/**
 * @swagger
 * /api/v1/admin/offer/edit:
 *  post:
 *    tags: [admin-offer]
 *    description: add new offer
 *    parameters:
 *      - in: formData
 *        name: OfferID
 *      - in: formData
 *        name: OfferName
 *      - in: formData
 *        name: OfferDesc
 *      - in: formData
 *        name: DiscountPercent
 *      - in: formData
 *        name: OfferStartingDate
 *        type: date
 *      - in: formData
 *        name: OfferEndingDate
 *        type: date
 *      - in: formData
 *        name: OfferType
 *      - in: formData
 *        name: Subcategories
 *      - in: formData
 *        name: Products
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */

router.post("/edit", HasPerm, upload.none(), async (req, res) => {
  try {
    const { OfferID } = req.body;
    if (!OfferID) {
      throw new Error("OfferID is required");
    }

    const updated_offer = await OfferModal.findOneAndUpdate(
      { OfferID },
      req.body,
      { new: true }
    );

    // admins action log
    const admin_action = `Offer Edited: ${updated_offer.OfferName}`
    const admin_act_desc = `OfferID: ${OfferID}`
    const admin_username = req.decodedToken.username
    await AdminLogModel.create({ username: admin_username, action: admin_action, action_desc: admin_act_desc })


    res.status(200).json({
      status: 200,
      offer: updated_offer,
    });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/offer/delete:
 *  post:
 *    tags: [admin-offer]
 *    description: delete offer
 *    parameters:
 *      - in: formData
 *        name: OfferID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */

router.delete("/delete", HasPerm, upload.none(), async (req, res) => {
  try {
    const { OfferID } = req.body;
    if (!OfferID) {
      throw new Error("OfferID is required");
    }
    const offer = await OfferModal.findOne({ OfferID });
    if (!offer?.OfferID) {
      throw new Error("Offer not found")
    }
    //delte doc
    const deleted_offer = await OfferModal.findOneAndDelete({ OfferID });

    // admins action log
    const admin_action = `Offer Deleted: ${deleted_offer.OfferName}`
    const admin_act_desc = `OfferID: ${OfferID}`
    const admin_username = req.decodedToken.username
    await AdminLogModel.create({ username: admin_username, action: admin_action, action_desc: admin_act_desc })


    res.status(200).json({
      status: 200,
      offer: deleted_offer,
    });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

module.exports = router;
