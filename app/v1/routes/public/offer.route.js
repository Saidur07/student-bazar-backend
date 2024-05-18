const express = require("express");
const router = express();
const OfferModel = require("../../models/offer.model");
const ProductModel = require("../../models/product.model");
const {OFFER_TYPES} = require("../../constant");

/**
 * @swagger
 * /api/v1/public/offer/offers:
 *  get:
 *    description: Get all offers
 *    tags: [public-offer]
 *    responses:
 *      '200':
 *        description: A successful response
 *      '404':
 *        description: Bad request
 */
router.get("/offers", async (_req, res) => {
  try {
    const { limit = 5 } = _req.query;
    const offers = await OfferModel.find().limit(limit);

    // get products of each offer
    const data = await Promise.all(
      offers.map(async (offer) => {
        if(offer.OfferType === OFFER_TYPES.PRODUCT){
          const productIDs = offer.Products
          // search product with productID list
          const products = await ProductModel.find({ProductID: {$in: productIDs}}) 
          
          return {
            ...offer.toJSON(),
            Products: products
          }
        }else if(offer.OfferType === OFFER_TYPES.CATEGORY){
          const categoryIDs = offer.Subcategories
          // search product with productID list
          const products = await ProductModel.find({SubCategoryID: {$in: categoryIDs}}) 
          return {
            ...offer.toJSON(),
            Products: products
          }
        }
      })
      )

    res.status(200).json({
      status: 200,
      offers: data,
    });
  } catch (e) {
    res.status(400).json({
      status: 400,
      message: e.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/public/offer/offer:
 *  get:
 *    tags: [public-offer]
 *    description: Get individual offer data
 *    parameters:
 *      - in: query
 *        name: OfferID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.get("/offer", async (req, res) => {
  try {
    const {OfferID} = req.query;
    const offer = await OfferModel.findOne({OfferID});
    res.status(200).json({
      status: 200,
      offer: offer,
    });
  } catch (e) {}
});

/**
 * @swagger
 * /api/v1/public/offer/offer-products:
 *  get:
 *    tags: [public-offer]
 *    description: Get offer products
 *    parameters:
 *      - in: query
 *        name: OfferID
 *      - in: query
 *        name: limit
 *      - in: query
 *        name: page
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.get('/offer-products',async (req,res)=>{
    try{
        const {OfferID, limit=10, page=1} = req.query
        const offer = await OfferModel.findOne({OfferID})
        let products;
        if(offer?.OfferType === "PRODUCT"){
          products = await ProductModel.find({ProductID: {$in:offer?.Products}}).limit(limit).skip((page-1)*limit)
        }else if(offer?.OfferType === "SUBCATEGORY"){
          products = await ProductModel.find({SubCategoryID: {$in:offer?.Subcategories}}).limit(limit).skip((page-1)*limit)
        }
      res.status(200).json({
        status: 200,
        products: products,
      })
    }catch(e){
        res.status(400).json({
        status: 400,
        message: e.message,
        })
    }
})

module.exports = router;
