const express = require("express");
const router = express();
const popupModel = require("../../models/popup.model");

/**
 * @swagger
 * /api/v1/public/popup/:
 *  get:
 *    tags: [public-popup]
 *    description: get popups
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.get("/", async (req, res) => {
    try {
        const popup = await popupModel.find(req.query);
        res.status(200).json({ status: 200, data: popup });
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message });
    }
});

/**
 * @swagger
 * /api/v1/public/popup/{popupID}:
 *  get:
 *    tags: [public-popup]
 *    description: edit popup
 *    parameters:
 *     - in: path
 *       name: popupID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.get("/:id", async (req, res) => {
    try {
        const popup = await popupModel.findOne({ popupId: req.params.id });
        res.status(200).json({ status: 200, data: popup });
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message });
    }
});

module.exports = router;