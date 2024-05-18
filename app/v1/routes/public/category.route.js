const express = require("express");
const router = express();
const CategoryModel = require("../../models/category.model");
const ProductModel = require('../../models/product.model')
const HomePageAcademicModel = require('../../models/home-page-academia-book-category.model')

/**
 * @swagger
 * /api/v1/public/category/categories:
 *  get:
 *    tags: [public-category]
 *    description: Get all categories
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */

router.get("/categories", async (req, res) => {
  try {
    const categories = await CategoryModel.find(req.query);
    res.status(200).json({ status: 200, categories });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});


/**
 * @swagger
 * /api/v1/public/category/home-page-academic:
 *  get:
 *    tags: [public-category]
 *    description: Get all categories
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.get("/home-page-academic", async (req, res) => {
  try {
    const categories = await HomePageAcademicModel.find(req.query);
    res.status(200).json({ status: 200, categories });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
})


// router.get('/popular',async(req,res)=>{
//     try{
//         const categories = await CategoryModel.find({Popular:true, ...req.query});  
//         res.status(200).json({status:200,categories})
//     }catch(e){
//         res.status(400).json({status:400,message:e.message})
//     }
// })

// router.get('/popular-with-products',async(req,res)=>{
//   try{
//       const categories = await CategoryModel.find({Popular:true, ...req.query});

//       // fetch all products of each category asynchronously
//       const combinedData = await Promise.all(categories.map(async(category)=>{
//         const product =  await ProductModel.find({CategoryID:category.CategoryID})
//         return{
//           ...category.toJSON(),
//           products:product
//         }
//       }))

//       res.status(200).json({status:200,catagories:combinedData})
//   }catch(e){
//       res.status(400).json({status:400,message:e.message})
//   }
// })

module.exports = router;
