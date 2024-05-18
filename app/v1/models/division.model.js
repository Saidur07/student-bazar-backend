const mongoose = require("mongoose");

const DivisionSchema = new mongoose.Schema({
    division_id:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    }
})

const DivisionModel = mongoose.model("divisions", DivisionSchema);
module.exports = DivisionModel;
