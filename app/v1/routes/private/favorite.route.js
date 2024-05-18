const express = require('express')
const router = express()
const {upload} = require('../../middlewares/multer')
const FavoriteModel = require('../../models/favorite.model')
const ProductsModel = require('../../models/product.model')

/**
 * @swagger
 * /api/v1/private/customer/toggle_favorite:
 *  patch:
 *    tags: [private-favorite]
 *    description: toggle favorite
 *    parameters:
 *      - in: formData
 *        name: ProductID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.patch('/toggle_favorite', upload.none(), async (req, res) => {
    try{
        const {ProductID} = req.body
        const {CustomerID} = req.decodedToken
        if(!ProductID){
            throw new Error('ProductID is required')
        }
        const fav_data = await FavoriteModel.findOne({CustomerID: CustomerID})
        let items = fav_data?.toJSON().Items ? fav_data.toJSON().Items : []
        let item = items.find(item => item === ProductID)
        if(item){
            // remove item
            items = items.filter((item)=> item !== ProductID)
        }else{
            items.push(ProductID)
        }
        const data = {
            CustomerID: CustomerID,
            Items: items,
        }
        const new_fav_data = await FavoriteModel.findOneAndUpdate({CustomerID: CustomerID}, data, {new:true,upsert:true})
        res.status(200).json({status:200, favorite_data: new_fav_data})
    }catch (e) {
        res.status(400).json({status:400, message:e.message})
    }
})

/**
 * @swagger
 * /api/v1/private/customer/get_favorite_items:
 *  get:
 *    tags: [private-favorite]
 *    description: toggle favorite
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.get('/get_favorite_items', async (req, res) => {
    try{
        const {CustomerID} = req.decodedToken
        const fav_data = await FavoriteModel.findOne({CustomerID: CustomerID})
        const items = fav_data?.toJSON().Items ? fav_data.toJSON().Items : []

        const products = await ProductsModel.find({ProductID: {$in: items}})

        res.status(200).json({status:200, products})
    }catch (e) {
        res.status(400).json({status:400, message:e.message})
    }
})

module.exports = router;
