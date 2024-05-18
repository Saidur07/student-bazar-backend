const mongoose = require('mongoose')

const BannerSchema = new mongoose.Schema({
    BannerID:{
        type:String,
        required:true,
        unique:true
    },
    BannerTitle:{
        type:String,
        required:true
    },
    BannerImage:{
        type:String,
        required:true
    },
    BannerLink:{
        type:String,
        required:true
    },
    ActiveBanner:{
        type:Boolean,
        required:true,
        default:true
    },
    TimeStamp:{
        type:Date,
        required:true,
        default: new Date()
    }
})

const BannerModel = mongoose.model('banners', BannerSchema)

module.exports = BannerModel
