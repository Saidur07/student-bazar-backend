const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
    blogID: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    date: {
        type: Date
    },
    tags: {
        type: [String],
    },
    urlSlug: {
        type: String,
        required: true,
        unique: true
    },
    categories: {
        type: [String],
        required: true,
    },
}).index({ title: "text" });

const AddressModel = mongoose.model("blogs", AddressSchema);
AddressModel.createIndexes()
module.exports = AddressModel;
