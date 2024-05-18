const express = require("express");
const router = express();
const DivisionModel = require("../../models/division.model");
const DistrictModel = require("../../models/districts.model");
const UpazilaModel = require("../../models/upazilla.model");


/**
 * @swagger
 * /api/v1/public/address-info/division_list:
 *  get:
 *   tags: [public-address]
 *   description: Use to request all divisions
 *   responses:
 *    '200':
 *      description: A successful response
 *    '400':
 *      description: Bad request
 * 
 */

router.get("/division_list", async (req, res) => {
  try {
    const divisions = await DivisionModel.find(req.query);
    res.status(200).json({ status: 200, divisions: divisions });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/public/address-info/district_list_with_division:
 *  get:
 *   tags: [public-address]
 *   description: Use to request all districts with division id
 *   parameters:
 *    - in: query
 *      name: division_id
 *      schema:
 *        type: string
 *        required: true
 *        description: Enter Division ID
 *   responses:
 *    '200':
 *      description: A successful response
 *    '400':
 *      description: Bad request
 * 
 */

router.get("/district_list_with_division", async (req, res) => {
  try {
    const districts = await DistrictModel.find(req.query);
    res.status(200).json({ status: 200, districts: districts });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});


/**
 * @swagger
 * /api/v1/public/address-info/upazila_list_with_district:
 *  get:
 *   tags: [public-address]
 *   description: Use to request all districts with division id
 *   parameters:
 *    - in: query
 *      name: district_id
 *      schema:
 *        type: string
 *        required: true
 *        description: Enter Division ID
 *   responses:
 *    '200':
 *      description: A successful response
 *    '400':
 *      description: Bad request
 * 
 */


router.get("/upazila_list_with_district", async (req, res) => {
  try {
    // const { district_id } = req.query;
    const upazilas = await UpazilaModel.find(req.query);
    res.status(200).json({ status: 200, upazilas: upazilas });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

module.exports = router;
