const express = require('express');
const router = express()
const AuthorModel = require('../../models/author.model')
const { GenerateUniqueId } = require('../../utility/unique-id-generator')
console.log(GenerateUniqueId());
const { upload } = require('../../middlewares/multer')
const FileUpload = require('../../utility/file-upload')
const fs = require('fs')
const AdminLogModel = require('../../models/admin-log.model')
const deleteFile = require('../../utility/delete-file')
const { PERMS } = require('../../constant')

const HasPerm = (req, res, next) => {
    try {
        /// check if same element exist in 2 arrays
        const hasPerm = req?.admin.Permissions?.some((item) => PERMS.CATEGORY_MANAGE_PERMISSIONS.includes(item));
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
 * /api/v1/admin/author/add_new:
 *  post:
 *    tags: [admin-author]
 *    description: add new author
 *    parameters:
 *      - in: formData
 *        name: AuthorName
 *      - in: formData
 *        name: AuthorNameBN
 *      - in: formData
 *        name: AuthorDesc
 *      - in: formData
 *        name: AuthorPhoto
 *        type: file
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post('/add_new', HasPerm, upload.none(), async (req, res) => {
    try {
        const {
            AuthorName,
            AuthorNameBN,
            AuthorDesc
        } = req.body
        const admin = req.decodedToken

        const exists = await AuthorModel.findOne({ AuthorName })

        if (exists?.AuthorName) {
            throw new Error('Author already exists')
        }

        const AuthorPhoto = req.body.AuthorPhoto

        const ID = GenerateUniqueId()

        const AuthorSlug = AuthorName.replace(/\s+/g, '-').toLowerCase()

        const data = await AuthorModel.create({
            AuthorID: ID,
            AuthorName,
            AuthorNameBN,
            AuthorPhoto: AuthorPhoto,
            AuthorDesc,
            BookCount: 0,
            AuthorSlug
        })

        // admins action log
        const admin_action = 'Added New Author: ' + AuthorName
        const admin_act_desc = ''
        await AdminLogModel.create({ username: admin.username, action: admin_action, action_desc: admin_act_desc })

        res.status(200).json({ status: 200, author: data })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})


/**
 * @swagger
 * /api/v1/admin/author/edit:
 *  post:
 *    tags: [admin-author]
 *    description: edit new author
 *    parameters:
 *      - in: formData
 *        name: AuthorName
 *      - in: formData
 *        name: AuthorNameBN
 *      - in: formData
 *        name: AuthorDesc
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post('/edit', HasPerm, upload.none(), async (req, res) => {
    try {
        const {
            AuthorID,
            AuthorName,
            AuthorNameBN,
            AuthorDesc,
            AuthorPhoto
        } = req.body
        const admin = req.decodedToken

        const authorData = await AuthorModel.findOne({ AuthorID })

        if (!authorData.AuthorID) {
            res.status(400).json({ status: 400, message: "Author Doesnot exist" })
            return
        }

        const updated_data = {
            AuthorID: AuthorID,
            AuthorName: AuthorName ? AuthorName : authorData.AuthorName,
            AuthorNameBN: AuthorNameBN ? AuthorNameBN : authorData.AuthorNameBN,
            AuthorDesc: AuthorDesc ? AuthorDesc : authorData.AuthorDesc,
            AuthorPhoto: AuthorPhoto ? AuthorPhoto : authorData.AuthorPhoto,
        }

        if (AuthorPhoto && AuthorPhoto !== authorData.AuthorPhoto) {
            await deleteFile(authorData.AuthorPhoto)
        }

        const data = await AuthorModel.findOneAndUpdate({ AuthorID }, updated_data, { new: true })

        // admins action log
        const admin_action = `Edited Author: ${AuthorName}`
        const admin_act_desc = `AuthorID: ${AuthorID}`
        await AdminLogModel.create({ username: admin.username, action: admin_action, action_desc: admin_act_desc })

        res.status(200).json({ status: 200, author: data })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})

/**
 * @swagger
 * /api/v1/admin/author/delete:
 *  delete:
 *    tags: [admin-author]
 *    description: add new author
 *    parameters:
 *      - in: query
 *        name: AuthorID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.delete('/delete', HasPerm, upload.none(), async (req, res) => {
    try {
        const {
            AuthorID
        } = req.query
        const admin = req.decodedToken

        const authorData = await AuthorModel.findOne({ AuthorID })

        if (!authorData.AuthorID) {
            res.status(400).json({ status: 400, message: "Author Doesnot exist" })
            return
        }

        await AuthorModel.findOneAndDelete({ AuthorID })
        await deleteFile(authorData?.AuthorPhoto);

        // admins action log
        const admin_action = `Deleted Author: ${authorData?.AuthorName}`
        const admin_act_desc = `AuthorID: ${AuthorID}`
        await AdminLogModel.create({ username: admin.username, action: admin_action, action_desc: admin_act_desc })

        res.status(200).json({ status: 200, message: 'Author Deleted Successfully' })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})

/**
 * @swagger
 * /api/v1/admin/author/toggle-popular:
 *  post:
 *    tags: [admin-author]
 *    description: toggle popular author
 *    parameters:
 *      - in: formData
 *        name: AuthorID
 *      - in: formData
 *        name: Popular
 *        type: boolean
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post('/toggle-popular', HasPerm, upload.none(), async (req, res) => {
    try {
        const {
            AuthorID,
            Popular
        } = req.body
        const admin = req.decodedToken

        const authorData = await AuthorModel.findOne({ AuthorID })

        if (!authorData.AuthorID) {
            res.status(400).json({ status: 400, message: "Author Doesnot exist" })
            return
        }

        await AuthorModel.findOneAndUpdate({ AuthorID }, { Popular: Popular }, { new: true })

        // admins action log
        const admin_action = `Toggled Popular Author: ${authorData?.AuthorName}`
        const admin_act_desc = `AuthorID: ${AuthorID}`
        await AdminLogModel.create({ username: admin.username, action: admin_action, action_desc: admin_act_desc })

        res.status(200).json({ status: 200, message: 'Author Popular Status Changed Successfully', author: authorData })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})

module.exports = router;
