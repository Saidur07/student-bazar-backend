const mongoose = require("mongoose");

const CommonInfoSchema = mongoose.Schema({
    AttributeName: {
        type: String,
        required: true
    },
    AttributeValue: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
})

const CommonInfoModel = mongoose.model('common_info', CommonInfoSchema)

module.exports = CommonInfoModel