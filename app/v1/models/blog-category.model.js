const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
    CategoryID: {
        type: String,
        required: true,
        unique: true
    },
    CategoryName: {
        type: String,
        required: true
    },
    CategoryDescription: {
        type: String
    },
    CategoryURLSlug: {
        type: String,
        required: true,
        unique: true
    }
})

const AddressModel = mongoose.model("blog-category", AddressSchema);
module.exports = AddressModel;
