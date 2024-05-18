const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
    CustomerID:{
        type: String,
        required:true,
        unique:true
    },
    Items:{
        type: [String],
        default:[]
    }
})

const FavoriteModel = mongoose.model('favorites', FavoriteSchema);
module.exports = FavoriteModel;
