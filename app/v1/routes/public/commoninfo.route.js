const express = require('express')
const CommonInfoModel = require("../../models/common-info.model");
const router = express()

/**
 * @swagger
 * /api/v1/public/commoninfo/:
 *  get:
 *    tags: [public-commoninfo]
 *    description: Get all Common Infos
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */

router.get('/', async (req, res) => {
    try {
        const attributes = await CommonInfoModel.find({})
        const attributes_obj = {}
       attributes.map(attribute => {
            attributes_obj[attribute.AttributeName] = attribute.AttributeValue
        })

        res.status(200).json({status: 200, attributes:attributes_obj})
    } catch (e) {
        res.status(400).json({status: 400, message: e.message})
    }
})

/**
 * @swagger
 * /api/v1/public/commoninfo/{attribute_name}:
 *  get:
 *    tags: [public-commoninfo]
 *    description: Get attribute with attribute name
 *    parameters:
 *      - in: path
 *        name: attribute_name
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */

router.get('/:attribute_name', async (req, res) => {
    try{
        const {attribute_name} = req.params
        const attribute = await CommonInfoModel.findOne({AttributeName:attribute_name})
        const data = {}
        data[attribute.AttributeName] = attribute.AttributeValue
        res.status(200).json({status:200, data:data})
    }catch (e) {
        res.status(400).json({status:400, message:e.message})
    }
})

module.exports = router;
