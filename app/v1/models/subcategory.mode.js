const mongoose = require("mongoose");

const SubCategorySchema = new mongoose.Schema({
    SubCategoryName: {
        type: String,
        required: true
    },
    SubCategoryID: {
        type: Number,
        required: true,
        unique: true
    },
    CategoryID: {
        type: Number,
        required: true
    },
    SubCategoryBanner: {
        type: String,
        required: true
    }
})

const SubCategoryModel = mongoose.model("subcategorys", SubCategorySchema);
module.exports = SubCategoryModel;
