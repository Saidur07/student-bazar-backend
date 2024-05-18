const express = require('express')
const router = express()
const { upload } = require('../../middlewares/multer')
const popupModel = require('../../models/popup.model')
const deleteFile = require('../../utility/delete-file')
const { v4 } = require('uuid')

/**
 * @swagger
 * /api/v1/admin/popup/:
 *  post:
 *    tags: [admin-popup]
 *    description: new popup
 *    parameters:
 *     - in: formData
 *       name: image
 *     - in: formData
 *       name: url
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.post('/', upload.none(), async (req, res) => {
    try {
        const popup = new popupModel({
            popupId: v4(),
            image: req.body.image,
            createdAt: new Date(),
            active: true,
            url: req.body.url,
            title: req.body.title
        })
        await popup.save()
        res.status(200).json({ status: 200, data: popup })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})

/**
 * @swagger
 * /api/v1/admin/popup/{popupID}:
 *  patch:
 *    tags: [admin-popup]
 *    description: edit popup
 *    parameters:
 *     - in: path
 *       name: popupID
 *     - in: formData
 *       name: image
 *     - in: formData
 *       name: url
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.patch('/:id', upload.none(), async (req, res) => {
    try {
        const popup = await popupModel.findOneAndUpdate({
            popupId: req.params.id
        }, req.body)
        res.status(200).json({ status: 200, data: popup })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})

/**
 * @swagger
 * /api/v1/admin/popup/{popupID}:
 *  delete:
 *    tags: [admin-popup]
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
router.delete('/:id', async (req, res) => {
    try {
        const popup = await popupModel.findOne({
            popupId: req.params.id
        })
        await deleteFile(popup.image)
        await popupModel.findOneAndDelete({
            popupId: req.params.id
        })

        res.status(200).json({ status: 200, data: popup })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})

module.exports = router
