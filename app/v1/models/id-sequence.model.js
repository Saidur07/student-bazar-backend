const mongoose = require("mongoose");

const SequenceSchema = new mongoose.Schema({
    SequencesName:{
        type:String,
        required:true,
        unique:true
    },
    SequenceCount:{
        type:Number,
        required: true,
        default:0
    }
})

const SequenceModal = mongoose.model("sequences", SequenceSchema);
module.exports = SequenceModal;
