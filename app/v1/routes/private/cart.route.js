const express = require('express')
const router = express()
const CartModel = require('../../models/cart.model')
const ProductModel = require('../../models/product.model')
const {upload} = require('../../middlewares/multer')

/**
 * @swagger
 * /api/v1/private/cart/update:
 *  put:
 *    tags: [private-cart]
 *    description: update cart
 *    parameters:
 *      - in: body
 *        name: Items
 *        schema:
 *          type: array
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.put('/update', upload.none(), async (req, res)=>{
    try{
        const {Items} = req.body
        console.log(Items)
        const data = {
            CustomerID: req.decodedToken.CustomerID,
            Items:Items ? JSON.parse(Items) : []
        }
        const cart_data = await CartModel.findOneAndUpdate({CustomerID: req.decodedToken.CustomerID}, data, {new:true,upsert:true})
        res.status(200).json({status:200, cart_data})
    }catch (e) {
        res.status(400).json({status:400, message:e.message})
    }
})

/**
 * @swagger
 * /api/v1/private/cart/remove_product:
 *  patch:
 *    tags: [private-cart]
 *    description: remove item from cart
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
router.patch('/remove_product', upload.none(), async (req, res)=>{
    try{
       const {ProductID} = req.body
        const cart_data = await CartModel.findOne({CustomerID: req.decodedToken.CustomerID})
        const new_items = cart_data.Items.filter(item=>item.ProductID!==ProductID)
        const data = {
           CustomerID: req.decodedToken.CustomerID,
            Items:new_items
       }
       const new_cart_data = await CartModel.findOneAndUpdate({CustomerID: req.decodedToken.CustomerID}, data, {new:true,upsert:true})

        res.status(200).json({status:200, new_cart_data})

    }catch (e) {
        res.status(400).json({status:400, message:e.message})
    }
})

/**
 * @swagger
 * /api/v1/private/cart/increase_quantity:
 *  patch:
 *    tags: [private-cart]
 *    description: increase quantity of item in cart
 *    parameters:
 *      - in: formData
 *        name: ProductID
 *      - in: formData
 *        name: Quantity
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.patch('/increase_quantity', upload.none(), async (req, res)=>{
    try{
        const {ProductID, Quantity} = req.body
        if(!Quantity || !ProductID){
            throw new Error('ProductID or Quantity is not defined')
        }
        const cart_data = await CartModel.findOne({CustomerID: req.decodedToken.CustomerID})
        const ProductData = await ProductModel.findOne({ProductID: ProductID})
        const ProductQuantity = ProductData?.UnitInStock
        const items = cart_data?.toJSON().Items ? cart_data.toJSON().Items : []
        let item = items.find(item => item.ProductID === ProductID)
        if(item){
            item.Quantity += Number(Quantity)
        } else{
            items.push({
                ProductID,
                Quantity
            })
            item = items.find(item => item.ProductID === ProductID)
        }
        if(item.Quantity > ProductQuantity){
            throw new Error('Product quantity is not enough')
        }
        const data = {
            CustomerID: req.decodedToken.CustomerID,
            Items:items
        }

        const new_cart_data = await CartModel.findOneAndUpdate({CustomerID: req.decodedToken.CustomerID}, data, {new:true,upsert:true})
        res.status(200).json({status:200, cart_data:new_cart_data})
    }catch (e) {
        res.status(400).json({status:400, message:e.message})
    }
})


/**
 * @swagger
 * /api/v1/private/cart/decrease_quantity:
 *  patch:
 *    tags: [private-cart]
 *    description: decrease quantity of item in cart
 *    parameters:
 *      - in: formData
 *        name: ProductID
 *      - in: formData
 *        name: Quantity
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.patch('/decrease_quantity', upload.none(), async (req, res)=>{
    try{
        const {ProductID, Quantity} = req.body
        if(!Quantity || !ProductID){
            throw new Error('ProductID or Quantity is not defined')
        }
        const cart_data = await CartModel.findOne({CustomerID: req.decodedToken.CustomerID})
        const ProductData = await ProductModel.findOne({ProductID: ProductID})
        const ProductQuantity = ProductData?.UnitInStock
        const items = cart_data?.toJSON().Items ? cart_data.toJSON().Items : []
        const item = items.find(item => item.ProductID === ProductID)
        if(item){
            item.Quantity -= Number(Quantity)
        } else{
            throw new Error('Product is not in cart')
        }
        if(item.Quantity < 0){
            throw new Error('Product quantity is not enough')
        }

        const data = {
            CustomerID: req.decodedToken.CustomerID,
            Items:items
        }

        if(item.Quantity <= 0){
            // remove item
            data.Items = items.filter(item => item.ProductID !== ProductID)
        }
        const new_cart_data = await CartModel.findOneAndUpdate({CustomerID: req.decodedToken.CustomerID}, data, {new:true,upsert:true})
        res.status(200).json({status:200, cart_data:new_cart_data})
    }catch (e) {
        res.status(400).json({status:400, message:e.message})
    }
})

/**
 * @swagger
 * /api/v1/private/cart/update_quantity:
 *  patch:
 *    tags: [private-cart]
 *    description: update quantity of item in cart
 *    parameters:
 *      - in: formData
 *        name: ProductID
 *      - in: formData
 *        name: Quantity
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.patch('/update_quantity', upload.none(), async (req, res)=>{
    try{
        const {ProductID, Quantity} = req.body
        if(!Quantity || !ProductID){
            throw new Error('ProductID or Quantity is not defined')
        }
        const cart_data = await CartModel.findOne({CustomerID: req.decodedToken.CustomerID})
        const items = cart_data?.toJSON().Items ? cart_data.toJSON().Items : []
        let item = items.find(item => item.ProductID === ProductID)
        const ProductData = await ProductModel.findOne({ProductID: ProductID})
        const ProductQuantity = ProductData?.UnitInStock
        if(item){
            item.Quantity = Number(Quantity)
        }else {
            items.push({
                ProductID,
                Quantity
            })
            item = items.find(item => item.ProductID === ProductID)
        }
        if(item.Quantity > ProductQuantity){
            throw new Error('Product quantity is not enough')
        }

        const new_cart_data = {
            CustomerID: req.decodedToken.CustomerID,
            Items:items
        }

        if(item.Quantity <= 0){
            // remove item
            new_cart_data.Items = items.filter(item => item.ProductID !== ProductID)
        }

        const updated_cart_data = await CartModel.findOneAndUpdate({CustomerID: req.decodedToken.CustomerID}, new_cart_data, {new:true,upsert:true})

        res.status(200).json({status:200, cart_data:updated_cart_data})
    }catch (e) {
        res.status(400).json({status:400, message:e.message})
    }
})

/**
 * @swagger
 * /api/v1/private/cart/items:
 *  get:
 *    tags: [private-cart]
 *    description: get all items in cart
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.get('/items', async (req, res)=>{
    try{
        const cart_data = await CartModel.findOne({CustomerID: req.decodedToken.CustomerID})
        res.status(200).json({status:200, cart_data})
    }catch (e) {
        res.status(400).json({status:400, message:e.message})
    }
})

/**
 * @swagger
 * /api/v1/private/cart/mark_selected:
 *  patch:
 *    tags: [private-cart]
 *    description: mark item as selected
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
router.patch('/mark_selected', upload.none(), async (req, res)=>{
    try{
     const {ProductID} = req.body
        const cart_data = await CartModel.findOne({CustomerID: req.decodedToken.CustomerID})
        const items = cart_data?.toJSON().Items ? cart_data.toJSON().Items : []
        const item = items.find(item => item.ProductID === ProductID)
        if(item){
            item.Selected = true
        }
        const data = {
            CustomerID: req.decodedToken.CustomerID,
            Items:items
        }

        const new_cart_data = await CartModel.findOneAndUpdate({CustomerID: req.decodedToken.CustomerID}, data, {new:true,upsert:true})
        res.status(200).json({status:200, cart_data:new_cart_data})
    }catch (e) {

    }
})

/**
 * @swagger
 * /api/v1/private/cart/mark_deselected:
 *  patch:
 *    tags: [private-cart]
 *    description: mark item as deselected
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
router.patch('/mark_deselected', upload.none(), async (req, res)=>{
    try{
        const {ProductID} = req.body
        const cart_data = await CartModel.findOne({CustomerID: req.decodedToken.CustomerID})
        const items = cart_data?.toJSON().Items ? cart_data.toJSON().Items : []
        const item = items.find(item => item.ProductID === ProductID)
        if(item){
            item.Selected = false
        }
        const data = {
            CustomerID: req.decodedToken.CustomerID,
            Items:items
        }

        const new_cart_data = await CartModel.findOneAndUpdate({CustomerID: req.decodedToken.CustomerID}, data, {new:true,upsert:true})
        res.status(200).json({status:200, cart_data:new_cart_data})
    }catch (e) {

    }
})

/**
 * @swagger
 * /api/v1/private/cart/mark_all_as_selected:
 *  patch:
 *    tags: [private-cart]
 *    description: mark all items as selected
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.patch('/mark_all_as_selected', upload.none(), async (req, res)=>{
    try{
        const {CustomerID} = req.decodedToken
        const cart_data = await CartModel.findOne({CustomerID: CustomerID})
        console.log(cart_data)
        const items = cart_data?.toJSON().Items ? cart_data.toJSON().Items : []
        console.log(items)
        items.forEach(item => {
            item.Selected = true
        })
        const data = {
            CustomerID: req.decodedToken.CustomerID,
            Items:items
        }
        const updated_cart_data = await CartModel.findOneAndUpdate({CustomerID: req.decodedToken.CustomerID}, data, {new:true})
        res.status(200).json({status:200, updated_cart_data})
    }catch (e) {
        res.status(400).json({status:400, message:e.message})
    }
})

/**
 * @swagger
 * /api/v1/private/cart/mark_all_as_deselected:
 *  patch:
 *    tags: [private-cart]
 *    description: mark all items as selected
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.patch('/mark_all_as_deselected', upload.none(), async (req, res)=>{
    try{
        const {CustomerID} = req.decodedToken
        const cart_data = await CartModel.findOne({CustomerID: CustomerID})
        console.log(cart_data)
        const items = cart_data?.toJSON().Items ? cart_data.toJSON().Items : []
        console.log(items)
        items.forEach(item => {
            item.Selected = false
        })
        const data = {
            CustomerID: req.decodedToken.CustomerID,
            Items:items
        }
        const updated_cart_data = await CartModel.findOneAndUpdate({CustomerID: req.decodedToken.CustomerID}, data, {new:true})
        res.status(200).json({status:200, updated_cart_data})
    }catch (e) {
        res.status(400).json({status:400, message:e.message})
    }
})

module.exports = router;
