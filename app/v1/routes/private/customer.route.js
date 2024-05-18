const express = require("express");
const router = express();
const CustomerModel = require("../../models/customer.model");
const { upload } = require("../../middlewares/multer");
const UploadToStorage = require("../../utility/file-upload");
const fs = require("fs");
const deleteFile = require('../../utility/delete-file')

/**
 * @swagger
 * /api/v1/private/customer/info:
 *  get:
 *    tags: [private-customer]
 *    description: get customer info
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.get("/info", async (req, res) => {
  try {
    const { CustomerID } = req.decodedToken;
    const customer = req?.customerData ? req.customerData : await CustomerModel.findOne({ CustomerID: CustomerID });
    res.status(200).json({ status: 200, user_data: customer });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});


/**
 * @swagger
 * /api/v1/private/customer/edit:
 *  patch:
 *    tags: [private-customer]
 *    description: edit customer info
 *    parameters:
 *      - in: formData
 *        name: FullName
 *      - in: formData
 *        name: PhoneNumber
 *      - in: formData
 *        name: Email
 *      - in: formData
 *        name: DateOfBirth
 *      - in: formData
 *        name: Gender
 *        description: MALE or FEMALE
 *         
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.patch("/edit", upload.none(), async (req, res) => {
  try {
    const { FullName, PhoneNumber, Email, DateOfBirth, Gender = "MALE" } = req.body;
    const { CustomerID } = req.decodedToken;
    const genders = ["MALE", "FEMALE"]
    if (!genders.includes(Gender)) {
      return res.status(400).json({ status: 400, message: "GENDER CAN ONLY BE MALE OR FEMALE" })
    }
    const data = {
      FullName,
      Email,
      DateOfBirth,
      Gender,
    };

    if (req.customerData.AuthProvider !== 'PHONE' && PhoneNumber) {
      if (!PhoneNumber.match(/^(\+8801)[1|3-9]{1}(\d){8}$/)) {
        return res.status(400).json({ status: 400, message: "Phone number is not valid" })
      }
      data.PhoneNumber = PhoneNumber;
    }
    const new_user = await CustomerModel.findOneAndUpdate(
      { CustomerID: CustomerID },
      data,
      { new: true, upsert: true }
    );
    res
      .status(200)
      .json({ status: 200, message: "Successful", data: new_user });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/private/customer/update_profile_picture:
 *  patch:
 *    tags: [private-customer]
 *    description: update profile picture
 *    parameters:
 *      - in: formData
 *        name: ProfilePic
 *        type: file
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.patch(
  "/update_profile_picture",
  upload.single("ProfilePic"),
  async (req, res) => {
    try {
      if (!req?.file?.path) {
        throw new Error("No file uploaded")
      }
      const customer = req?.customerData ? req.customerData : await CustomerModel.findOne({ CustomerID: req.decodedToken.CustomerID });
      const fileData = await UploadToStorage(req?.file?.path)
      const updatedProfilePic = await CustomerModel.findOneAndUpdate(
        { CustomerID: req.decodedToken.CustomerID },
        { ProfilePic: fileData[0].metadata.mediaLink },
        { new: true })
      fs.unlinkSync(req.file?.path)
      await deleteFile(customer?.ProfilePic)
      res.status(200).json({ status: 200, profilePic: updatedProfilePic })
    } catch (e) {
      fs.unlinkSync(req?.file?.path)
      res.status(400).json({ status: 400, message: e.message })
    }
  }
);

module.exports = router;
