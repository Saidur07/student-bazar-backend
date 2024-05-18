const express = require("express");
const router = express();
const { upload } = require("../../middlewares/multer");
const UploadToStorage = require("../../utility/file-upload");
const ContestModel = require("../../models/contest.model");
const AdminLogModel = require("../../models/admin-log.model");
const deleteFile = require("../../utility/delete-file");
const fs = require("fs");
const { PERMS } = require("../../constant");
const { v4 } = require('uuid')

const HasPerm = (req, res, next) => {
  try {
    /// check if same element exist in 2 arrays
    const hasPerm = req?.admin.Permissions?.some((item) => PERMS.SPECIAL_EXTRA_MANAGE_PERMISSION.includes(item));
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
 * /api/v1/admin/contests/:
 *  post:
 *    tags: [admin-contests]
 *    description: update logo
 *    parameters:
 *      - in: formData
 *        name: ContestName
 *      - in: formData
 *        name: ContestBanner
 *        type: file
 *      - in: formData
 *        name: ContestDescription
 *      - in: formData
 *        name: ContestStatus
 *      - in: formData
 *        name: ContestEndTime
 *        type: date
 *      - in: formData
 *        name: ContestStartDate
 *        type: date
 *      - in: formData
 *        name: LastDateOfRegistration
 *      - in: formData
 *        type: date
 *      - in: formData
 *        name: RegistrationURL
 *      - in: formData
 *        type: date
 *        name: ContestPrizes
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post("/", HasPerm, upload.none(), async (req, res) => {
  try {
    const {
      ContestName,
      ContestDescription,
      ContestStatus,
      ContestEndTime,
      ContestStartDate,
      LastDateOfRegistration,
      RegistrationURL,
      ContestPrizes,
      ContestBanner
    } = req.body;


    const new_contest = await ContestModel.create({
      ContestID: v4(),
      ContestName: ContestName && ContestName,
      ContestDescription: ContestDescription && ContestDescription,
      ContestStatus: ContestStatus && ContestStatus,
      ContestEndTime: ContestEndTime && ContestEndTime,
      ContestBanner: ContestBanner,
      ContestStartDate: ContestStartDate && ContestStartDate,
      LastDateOfRegistration: LastDateOfRegistration && LastDateOfRegistration,
      RegistrationURL: RegistrationURL && RegistrationURL,
      ContestPrizes: ContestPrizes && ContestPrizes.split(","),
    });

    // admins action log
    const admin_action = `Contest Created: ${ContestName}`;
    const admin_act_desc = `ContestID: ${ContestID}`;
    const admin_username = req.decodedToken.username;
    await AdminLogModel.create({
      username: admin_username,
      action: admin_action,
      action_desc: admin_act_desc,
    });

    res.status(200).json({ status: 200, contest: new_contest });
  } catch (e) {
    res.status(400).json({ status: 400, error: e.message });
  }
});


/**
 * @swagger
 * /api/v1/admin/contests/{ContestID}:
 *  post:
 *    tags: [admin-contests]
 *    description: update logo
 *    parameters:
 *      - in: path
 *        name: ContestID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post("/delete/:ContestID", HasPerm, async (req, res) => {
  try {
    const ContestID = req.params.ContestID;

    const contest = await ContestModel.findOne({ ContestID });
    if (!contest?.ContestID) {
      throw new Error("Contest not found");
    }

    const deleted = await ContestModel.deleteOne({ ContestID });
    await deleteFile(contest?.ContestBanner);

    // admins action log
    const admin_action = `Contest Deleted: ${deleted.ContestName}`;
    const admin_act_desc = `ContestID: ${ContestID}`;
    const admin_username = req.decodedToken.username;
    await AdminLogModel.create({
      username: admin_username,
      action: admin_action,
      action_desc: admin_act_desc,
    });

    if (deleted) {
      res.status(200).json({ status: 200, message: "Deleted successfully" });
    }
  } catch (e) {
    res.status(500).json({ status: 500, message: "Server side error" });
  }
});


/**
 * @swagger
 * /api/v1/admin/contests/edit:
 *  post:
 *    tags: [admin-contests]
 *    description: update logo
 *    parameters:
 *      - in: formData
 *        name: ContestID
 *      - in: formData
 *        name: ContestName
 *      - in: formData
 *        name: ContestBanner
 *        type: file
 *      - in: formData
 *        name: ContestDescription
 *      - in: formData
 *        name: ContestStatus
 *      - in: formData
 *        name: ContestEndTime
 *        type: date
 *      - in: formData
 *        name: ContestStartDate
 *        type: date
 *      - in: formData
 *        name: LastDateOfRegistration
 *      - in: formData
 *        type: date
 *      - in: formData
 *        name: RegistrationURL
 *      - in: formData
 *        type: date
 *        name: ContestPrizes
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post("/edit", HasPerm, upload.none(), async (req, res) => {
  try {
    const { ContestID } = req.body;
    const newData = {
      ...req.body,
    }

    const data = await ContestModel.findOne({ ContestID });

    if (req.body.ContestBanner && data.ContestBanner !== req.body.ContestBanner) {
      await deleteFile(data.ContestBanner);
      newData.ContestBanner = fileData;
    }

    const edited = await ContestModel.findOneAndUpdate(
      { ContestID },
      newData,
      {
        new: true,
      }
    );

    // admins action log
    const admin_action = `Contest Edited: ${edited.ContestName}`;
    const admin_act_desc = `ContestID: ${ContestID}`;
    const admin_username = req.decodedToken.username;
    await AdminLogModel.create({
      username: admin_username,
      action: admin_action,
      action_desc: admin_act_desc,
    });

    res.status(200).json({
      status: 200,
      message: "Contest Edited",
      data: edited,
    });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

module.exports = router;
