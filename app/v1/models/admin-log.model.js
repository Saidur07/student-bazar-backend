const mongoose = require("mongoose");

const AdminLogSchema = new mongoose.Schema({
    // logID:{
    //     type: String,
    //     // required:true,
    //     // unique:true,
    //     // default:String(Date.now()) + Math.random().toString(13).substr(2, 9)
    // },
    username:{
        type:String,
        required:true
    },
    action:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    createdDate:{
        type:Date,
        required:true,
        default:Date.now()
    }
})


const AdminLogModel = mongoose.model("admin_log", AdminLogSchema);
module.exports =  AdminLogModel