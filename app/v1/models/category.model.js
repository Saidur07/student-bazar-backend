const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema({
    CategoryID: {
        type: String,
        required: true,
        unique: true
    },
    ParentCategoryID: {
        type: String,
        required: true,
        default: "0"
    },
    CategoryName: {
        type: String,
        required: true
    },
    CategorySlug: {
        type: String,
        required: true,
        unique: true
    },
    ProductType: {
        type: String,
        required: true
    },
    CategoryBanner: {
        type: String,
        default: ""
    },
    Popular: {
        type: Boolean,
        required: true,
        default: false
    }
})

const CategoryModel = mongoose.model('categorys', CategorySchema)
module.exports = CategoryModel;