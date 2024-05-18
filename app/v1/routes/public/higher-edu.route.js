const express = require("express");
const router = express();
const HigherEduModel = require("../../models/higher-edu-model");


/**
 * @swagger
 * /api/v1/public/higher-edu/universities:
 *  get:
 *    tags: [public-higher-edu]
 *    description: Get all universities
 *    parameters:
 *      - in: query
 *        name: query
 *      - in: query
 *        name: page
 *      - in: query
 *        name: limit
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */

router.get("/universities", async (req, res) => {
    try {
        const { page = 1, limit = 50, query } = req.query
        // search in model

        const universities = Number(query) ? await HigherEduModel.find({ RankNo: query }).limit(parseInt(limit)).skip(parseInt(page - 1) * parseInt(limit))
            : !query ? await HigherEduModel.find(req.query).limit(parseInt(limit)).skip(parseInt(page - 1) * parseInt(limit))
                : await HigherEduModel.find({ $text: { $search: query, $caseSensitive: false, } }).limit(limit).skip((page - 1) * limit)

        res.status(200).json({
            status: 200,
            message: 'Universities',
            data: universities
        })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})

/**
 * @swagger
 * /api/v1/public/higher-edu/universities/get-one:
 *  get:
 *    tags: [public-higher-edu]
 *    description: Get Customer data
 *    parameters:
 *      - in: query
 *        name: InstituteID
 *      - in: query
 *        name: InstituteSlug
 *      - in: query
 *        name: RankNo
 *      - in: query
 *        name: InstituteName
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */

router.get("/universities/get-one", async (req, res) => {
    try {
        const university = await HigherEduModel.findOne(req.query)
        res.status(200).json({
            status: 200,
            message: 'University',
            data: university
        })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})

module.exports = router;
