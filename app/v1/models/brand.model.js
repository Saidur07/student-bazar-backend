const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
    BrandID: {
        type: String,
        required: true,
        unique: true
    },
    BrandName: {
        type: String,
        required: true
    },
    BrandSlug: {
        type: String,
        required: true,
        unique: true
    },
    BrandLogo: {
        type: String,
        required: true
    },
    BrandDescription: {
        type: String,
    },
})

const BrandModel = mongoose.model('brands', BrandSchema);
module.exports = BrandModel;
