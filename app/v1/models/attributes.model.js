const mongoose = require("mongoose");

const AttributesSchema = new mongoose.Schema({
    AttributeName:{
        type:String,
        required:true,
        unique:true
    },
    AttributeDesc:{
        type:String,
    }
});

const AuthorModel = mongoose.model("attributes", AttributesSchema);
module.exports = AuthorModel;

