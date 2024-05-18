const mongoose = require("mongoose");

const UpazilaSchema = new mongoose.Schema({
    upazila_id:{
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
    }
})

const UpazilaModel = mongoose.model("upazilas", UpazilaSchema);
module.exports = UpazilaModel;
