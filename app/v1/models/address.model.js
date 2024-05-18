const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
    CustomerID:{
        type: String,
        required:true
    },
    AddressID:{
      type:String,
        required:true,
        unique:true
    },
    Address:{
        type:String,
        required:true
    },
    DivisionID:{
        type:Number,
        required:true
    },
    DistrictID:{
        type:Number,
        required:true
    },
    UpazilaID: {
        type: Number,
        required: true
    },
    FullName:{
        type:String,
        required: true
    },
    PhoneNumber:{
        type:String,
        required:true
    },
    AlternatePhoneNumber:{
        type:String,
    },
    ReceiveAt:{
        type:Number, // 1 = Home, 2 = Office
        required:true
    }
})

const AddressModel = mongoose.model("addresses", AddressSchema);
module.exports = AddressModel;
