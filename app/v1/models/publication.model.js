const mongooge = require('mongoose');

const PublicationSchema = new mongooge.Schema({
    PublicationID:{
        type:String,
        required:true,
        unique:true
    },
    PublicationName:{
        type:String,
        required:true,
        unique:true
    },
    PublicationNameBN:{
        type:String,
        required:true,
        unique:true
    },
    PublicationPhoto:{
        type:String,
        required:true,
    },
    PublicationDesc:{
        type:String,
    },
    PublicationSlug:{
        type:String,
        required:true,
        unique:true
    }
})

const PublicationModel = mongooge.model('publications', PublicationSchema);
module.exports = PublicationModel;
