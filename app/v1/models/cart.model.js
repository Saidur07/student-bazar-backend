const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
    CustomerID:{
        type: String,
        required:true,
        unique:true
    },
    Items:{
        type: [{
            ProductID:{
                type: String,
                required:true
            },
            Quantity:{
                type: Number,
                required:true
            },
            Selected:{
                type: Boolean,
                required:true,
                default: true
            }
        }],
        required:true,
        default:[]
    }
})

const CartModel = mongoose.model("cart-data", CartSchema);
module.exports = CartModel;
