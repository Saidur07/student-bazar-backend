const mongoose = require("mongoose");

const DistrictSchema = new mongoose.Schema({
    division_id:{
        type:String,
        required:true
    },
    district_id:{
      type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    shipping_fee:{
        type:Number,
        required:true,
        default:120
    }
})

const DistrictModel = mongoose.model("districts", DistrictSchema);
module.exports = DistrictModel;
