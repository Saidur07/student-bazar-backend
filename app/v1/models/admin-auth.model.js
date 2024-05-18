const mongoose = require("mongoose");

const AdminAuthSchema = new mongoose.Schema({
  AdminID: {
    type: String,
    required: true,
    unique: true,
  },
  FullName: {
    type: String,
    required: true,
  },
  username:{
    type:String,
    required:true,
    unique:true
  },
  EncryptedPassword:{
    type:String,
      required:true
  },
  Disabled:{
    type:Boolean,
    default:false
  },
  Permissions:{
    type:[String],
    default:[]
  }
})

const AdminAuthModel = mongoose.model("admin_auth", AdminAuthSchema);
module.exports = AdminAuthModel;
