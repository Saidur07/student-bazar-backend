const express = require('express');
const router = express()
const Navbar = require('../../models/navbar.model');
const { GenerateUniqueId } = require("../../utility/unique-id-generator");
const { upload } = require('../../middlewares/multer');
const { PERMS } = require('../../constant')

const HasPerm = (req, res, next) => {
    try {
        /// check if same element exist in 2 arrays
        const hasPerm = req?.admin.Permissions?.some((item) => PERMS.SETTINGS_MANAGE_PERMISSION.includes(item));
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
 * /api/v1/admin/navbar/:
 *  get:
 *    tags: [admin-navbar]
 *    description: get navbar
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.get('/', HasPerm, async (req, res) => {
    try {
        const items = await Navbar.find({}).sort({ index: 1 });
        res.status(200).json(items);
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message });
    }
})

/**
 * @swagger
 * /api/v1/admin/navbar/:
 *  post:
 *    tags: [admin-navbar]
 *    description: get navbar
 *    parameters:
 *      - in: formData
 *        name: name
 *      - in: formData
 *        name: primaryURL
 *      - in: formData
 *        name: urls
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post('/', HasPerm, upload.none(), async (req, res) => {
    try {
        const all_items = await Navbar.find({}).sort({ index: 1 });
        const lastItem = all_items[all_items.length - 1];
        const index = all_items.length > 0 ? lastItem?.index + 1 : 1;
        const urls = req.body?.urls?.replaceAll(/ /g, '')?.split(',').length > 0 ? req.body.urls.replaceAll(/ /g, '').split(',') : [req.body.primaryURL];
        const item_id = GenerateUniqueId()

        const new_item = await Navbar.create({
            nav_item_id: item_id,
            name: req.body.name,
            primaryURL: req.body.primaryURL,
            urls: urls,
            index: index
        });

        res.status(200).json({ item: new_item });
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message });
    }
})

/**
 * @swagger
 * /api/v1/admin/navbar/{NavbarID}:
 *  delete:
 *    tags: [admin-navbar]
 *    description: get navbar
 *    parameters:
 *      - in: path
 *        name: NavbarID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.delete('/:id', HasPerm, async (req, res) => {
    try {
        const item = await Navbar.deleteOne({ nav_item_id: req.params.id });
        res.status(200).json({ item });
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message });
    }
})

module.exports = router;