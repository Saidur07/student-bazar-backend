const express = require("express");
const router = express();
const { upload } = require("../../middlewares/multer");
const AddressModel = require("../../models/address.model");

/**
 * @swagger
 * /api/v1/private/address/new:
 *  post:
 *    tags: [private-address]
 *    description: add new address
 *    parameters:
 *      - in: formData
 *        name: Address
 *      - in: formData
 *        name: DivisionID
 *      - in: formData
 *        name: DistrictID
 *      - in: formData
 *        name: UpazilaID
 *      - in: formData
 *        name: FullName
 *      - in: formData
 *        name: PhoneNumber
 *      - in: formData
 *        name: AlternatePhoneNumber
 *      - in: formData
 *        name: ReceiveAt
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post("/new", upload.none(), async (req, res) => {
  try {
    const {
      Address,
      DivisionID,
      DistrictID,
      UpazilaID,
      FullName,
      PhoneNumber,
      AlternatePhoneNumber,
      ReceiveAt=1,
    } = req.body;

    // generate unique address id
    const UniqueAddressID =
      Date.now().toString() + Math.floor(Math.random() * 1000000).toString();

    const address = await AddressModel.create({
      CustomerID: req.decodedToken.CustomerID,
      ...req.body,
      AddressID: UniqueAddressID,
    });

    res.status(200).json({ status: 200, address: address });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/private/address/edit:
 *  post:
 *    tags: [private-address]
 *    description: edit address
 *    parameters:
 *      - in: formData
 *        name: AddressID
 *      - in: formData
 *        name: Address
 *      - in: formData
 *        name: DivisionID
 *      - in: formData
 *        name: DistrictID
 *      - in: formData
 *        name: UpazilaID
 *      - in: formData
 *        name: FullName
 *      - in: formData
 *        name: PhoneNumber
 *      - in: formData
 *        name: AlternatePhoneNumber
 *      - in: formData
 *        name: ReceiveAt
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.patch("/edit", upload.none(), async (req, res) => {
  try {
    const { Address, DivisionID, DistrictID, UpazilaID, ReceiveAt, AddressID } =
      req.body;
    const CustomerID = req.decodedToken.CustomerID;
    if (!AddressID) {
      throw new Error("Address ID is required");
    }

    const prev_address = await AddressModel.findOne({ AddressID, CustomerID });

    if (!prev_address?.AddressID) {
      throw new Error("Address not found");
    }

    const data = {
      Address: Address ? Address : prev_address.Address,
      DivisionID: DivisionID ? DivisionID : prev_address.DivisionID,
      DistrictID: DistrictID ? DistrictID : prev_address.DistrictID,
      UpazilaID: UpazilaID ? UpazilaID : prev_address.UpazilaID,
      ReceiveAt: ReceiveAt ? ReceiveAt : prev_address.ReceiveAt,
    };

    const updated_address = await AddressModel.findOneAndUpdate(
      { AddressID },
      data,
      { new: true }
    );

    res.status(200).json({ status: 200, address: updated_address });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});


/**
 * @swagger
 * /api/v1/private/address/delete:
 *  delete:
 *    tags: [private-address]
 *    description: delete address
 *    parameters:
 *      - in: query
 *        name: AddressID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.delete("/delete", async (req, res) => {
  try {
    const { AddressID } = req.query;
    const CustomerID = req.decodedToken.CustomerID;
    if (!AddressID) {
      throw new Error("Address ID is required");
    }
    const address = await AddressModel.findOne({ AddressID });
    if (!address?.AddressID) {
      throw new Error("Address not found");
    }
    await AddressModel.findOneAndDelete({ AddressID, CustomerID });
    res
      .status(200)
      .json({ status: 200, message: "Address deleted successfully" });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/private/address/all_addresses:
 *  get:
 *    tags: [private-address]
 *    description: all addresses
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.get("/all_addresses", upload.none(), async (req, res) => {
  try {
    const addresses = await AddressModel.find({
      CustomerID: req.decodedToken.CustomerID,
    });

    res.status(200).json({ status: 200, addresses });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

module.exports = router;
