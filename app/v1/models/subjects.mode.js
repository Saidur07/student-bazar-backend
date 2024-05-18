const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
    SubjectID: {
        type: Number,
        required: true,
    },
    SubjectName: {
        type: String,
        required: true
    }
})

const SubjectModel = mongoose.model('subjects', SubjectSchema);
module.exports = SubjectModel;
