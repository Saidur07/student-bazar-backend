const mongoose = require('mongoose');

const HigherEduSchema = new mongoose.Schema({
    InstituteName: {
        type: String,
        required: true
    },
    ShortDesc: {
        type: String,
        required: true
    },
    Details: {
        type: String,
        required: true
    },
    RankNo: {
        type: Number,
        required: true,
        unique: true
    },
    Country: {
        type: String,
    },
    Logo: {
        type: String,
        required: true
    },
    Picture: {
        type: String,
        required: true
    },
    InstituteSlug: {
        type: String,
        required: true,
        unique: true
    },
    InstituteID: {
        type: String,
        required: true,
        unique: true
    }
}).index({ InstituteName: 'text', Country: 'text', Details: 'text', RankNo: 'text' })

const HigherEduModel = mongoose.model('higher-education', HigherEduSchema);
HigherEduModel.createIndexes()
module.exports = HigherEduModel;
