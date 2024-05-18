const express = require("express");
const router = express();

const CategoryModel = require("../../models/category.model");
const ProductModel = require("../../models/product.model");
const AuthorModel = require("../../models/author.model");
const PublicationModel = require("../../models/publication.model");

const getChildCategories = async (categoryID) => {
    const categories = await CategoryModel.find({ ParentCategoryID: categoryID })
    const childCategories = await Promise.all(
        categories.map(async (category) => {
            const childCategories = await getChildCategories(category.CategoryID)
            return {
                ...category.toJSON(),
                childCategories,
            }
        })
    )
    return childCategories
}


// router.get('/infos', async (req, res) => {
//     try{
//         const {CategorySlug} = req.query

//         const parent_category = await CategoryModel.findOne({CategorySlug})
//         if(!parent_category?.CategoryID){
//             return res.status(200).json({message:"Category not found", status:200, data:{}})
//         }
//         const childCategories = await getChildCategories(parent_category.CategoryID)
    
//         const products = await ProductModel.find({CategoryID:parent_category.CategoryID})
    
//         const authors_id = products.map(product => product.AuthorID)
//         const publication_id = products.map(product => product.PublicationID)
//         const authors = await AuthorModel.find({AuthorID: {$in: authors_id}})
//         const publications = await PublicationModel.find({PublicationID: {$in: publication_id}})
//         res.status(200).json({status: 200,data:{category:{...parent_category?.toJSON(), childCategories}, author_datas:authors, publication_datas:publications}})
//     }catch(e){
//         res.status(400).json({status:400,message:e.message})
//     }
//     const childCategories = await getChildCategories(
//       parent_category.CategoryID
//     );

//     const products = await ProductModel.find({
//       CategoryID: parent_category.CategoryID,
//     });

//     const authors_id = products.map((product) => product.AuthorID);
//     const publication_id = products.map((product) => product.PublicationID);
//     const authors = await AuthorModel.find({ AuthorID: { $in: authors_id } });
//     const publications = await PublicationModel.find({
//       PublicationID: { $in: publication_id },
//     });
//     res
//       .status(200)
//       .json({
//         status: 200,
//         data: {
//           category: { ...parent_category?.toJSON(), childCategories },
//           author_datas: authors,
//           publication_datas: publications,
//         },
//       });
//   } catch (e) {
//     res.status(400).json({ status: 400, message: e.message });
//   }
// });

module.exports = router;
