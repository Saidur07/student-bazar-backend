const express = require("express");
const router = express();
const ReviewModel = require("../../models/review.model");
const ProductModel = require("../../models/product.model");
const OrderModel = require("../../models/order.model");
const { upload } = require("../../middlewares/multer");
const UploadToStorage = require("../../utility/file-upload");
const fs = require("fs");

const updateProductReview = async ({ProductID}) => {
  try{
    const reviews = await ReviewModel.find({ProductID});
    // generate average rating
    let totalRating = 0;
    reviews.forEach(review => {
      totalRating += Number(review.StarCount);
    })
    const updated_product = await ProductModel.findOneAndUpdate({ProductID},{Rating: totalRating/reviews.length, Reviews: reviews.length},{new: true});     
    console.log(updated_product);
    return updated_product;
  }catch(err){
    console.log(err);
  }
}


/**
 * @swagger
 * /api/v1/private/review/user-reviews:
 *  get:
 *    tags: [private-review]
 *    description: get all reviews of a user
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.get("/user-reviews", upload.single("Picture"), async (req, res) => {
  try{
    const {CustomerID} = req.decodedToken

    const reviews = await ReviewModel.find({CustomerID, Deleted:false})

    // get all reviews Products
    const review_data_with_product_details = await Promise.all(reviews.map(async (review) => {
      const product = await ProductModel.findOne({ProductID: review?.ProductID})
      return {
        ...review.toJSON(),
        product_details: product.toJSON()
      }})
    )

    res.status(200).json({status:200, reviews : review_data_with_product_details ? review_data_with_product_details : []})
  }catch(e){
    res.status(400).json(e.message)
  }
})


/**
 * @swagger
 * /api/v1/private/review/new_review:
 *  post:
 *    tags: [private-review]
 *    description: review a product
 *    parameters:
 *      - in: formData
 *        name: ProductID
 *      - in: formData
 *        name: Review
 *      - in: formData
 *        name: StarCount
 *      - in: formData
 *        name: Attachments
 *        type: file
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post("/new_review", upload.array("Attachments", 3), async (req, res) => {
  try {
    // load the properties from review model
    const { ProductID, Review,StarCount } =req.body;
    if(StarCount > 5 || StarCount < 1){
      throw new Error("StarCount should be between 1 and 5")
    }
    const {CustomerID} = req.decodedToken
    // const fileData = await UploadToStorage(req.file.path)
    const product_order_data = await OrderModel.findOne({CustomerID, Products: {$elemMatch: {ProductID}}})
    const verified_purchase = product_order_data?.CustomerID ? true : false;
    const allFiles = req.files.map(async (file) => {
      const fileData = await UploadToStorage(file?.path);
      if (fileData) {
        fs.unlinkSync(file.path);
        return fileData[0].metadata.mediaLink;
      }
    });
    const reviewID = Date.now().toString() + Math.floor(Math.random() * 10000).toString();
    if (allFiles.length > 0) {
      const attachments = await Promise.all(allFiles);

      const reviewObj = {
        CustomerID,
        ProductID,
        Review,
        ReviewID: reviewID,
        CreatedDate: Date.now(),
        Attachments: attachments,
        StarCount:StarCount,
        VerifiedPurchase:verified_purchase
      };
      const newReview = new ReviewModel(reviewObj);
      const savedReview = await newReview.save();
      res.status(200).json({ status: 200, data: savedReview });
    }else{
      const reviewObj = {
        CustomerID,
        ProductID,
        Review,
        ReviewID: reviewID,
        CreatedDate: Date.now(),
        Attachments: [],
        StarCount:StarCount,
        VerifiedPurchase:verified_purchase
      }
      const newReview = new ReviewModel(reviewObj);
      const savedReview = await newReview.save();
      await updateProductReview({ProductID: ProductID});
      res.status(200).json({ status: 200, data: savedReview });
    }
  } catch (e) {
    fs.unlinkSync(req.file?.path);
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/private/review/update-review:
 *  patch:
 *    tags: [private-review]
 *    description: update product review
 *    parameters:
 *      - in: formData
 *        name: ReviewID
 *      - in: formData
 *        name: Review
 *      - in: formData
 *        name: StarCount
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.patch('/update-review', upload.single('Picture'), async (req, res) => {
  try{
    const {ReviewID,Review,StarCount} = req.body
    const {CustomerID} = req.decodedToken

    const updated_review = await ReviewModel.findOneAndUpdate({ReviewID,CustomerID},{Review, StarCount,Edited:true},{new:true})  
    await updateProductReview({ProductID: updated_review.ProductID});
    res.status(200).json({status:200, data:updated_review})
  }catch(e){
    res.status(400).json({ status: 400, message: e.message });
  }
})

/**
 * @swagger
 * /api/v1/private/review/delete-review:
 *  delete:
 *    tags: [private-review]
 *    description: delete product review
 *    parameters:
 *      - in: formData
 *        name: ReviewID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.delete('/delete-review', async (req, res) => {
  try{
    const {ReviewID} = req.query
    const {CustomerID} = req.decodedToken

    const data = await ReviewModel.findOneAndUpdate({ReviewID,CustomerID},{Deleted:true},{new:true})  
    res.status(200).json({status:200, deleted:data.Deleted})
  }catch(e){
    res.status(400).json({ status: 400, message: e.message });
  }
})

module.exports = router;
