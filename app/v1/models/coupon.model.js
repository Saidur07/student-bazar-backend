const mongoose = require("mongoose");

// coupon schema like woo commerce
// const CouponSchema = new mongoose.Schema({
//     CouponCode:{
//         type:String,
//         required:true,
//         unique:true
//     },
//     CouponType:{
//         type:String, // FIXED_CART,FIXED_PRODUCT,PERCENTAGE_PRODUCT
//         required:true 
//     },
//     CouponAmount:{
//         type:Number, // if coupon type is fixed then amount will be fixed amount else percentage
//         required:true,
//         default:0
//     },
//     CouponDescription:{
//         type:String,
//         required:true,
//         default:""
//     },
//     CouponStartDate:{
//         type:Date,
//         required:true,
//         default: new Date() // current date
//     },
//     CouponEndDate:{
//         type:Date,
//     },
//     CouponLimit:{
//         type:Number, // how many times coupon can be used
//         required:true       
//     },
//     CouponUsed:{
//         type:Number,
//         required:true,
//         default:0
//     },
//     CouponExcludedProducts:{
//         type:Array, // array of product ids
//         required:true,
//         default:[]
//     },
//     CouponExcludedCategories:{
//         type:Array, // array of category ids
//         required:true,
//         default:[]
//     },
//     CouponMinimumSpendAmount:{
//         type:Number, // minimum amount to apply coupon
//         required:true,
//         default:0
//     },
//     CouponMaximumSpendAmount:{
//         type:Number, // maximum amount to apply coupon
//         required:true,
//         default:0
//     },
//     CouponIndividualUse:{
//         type:Boolean, // if true then coupon can be used individually
//         required:true,
//         default:true
//     },
//     CouponExcludeSaleItems:{
//         type:Boolean, // exclude sale items
//         required:true,
//         default:true
//     },
//     CouponFreeShipping:{
//         type:Boolean, // if true then free shipping
//         required:true,
//         default:false
//     },
//     CouponProductIds:{
//         type:Array, // array of product ids
//         required:true,
//         default:[]
//     },
//     CouponCategoryIds:{
//         type:Array, // array of product ids
//         required:true,
//         default:[]
//     },
//     CouponUsageLimitPerUser:{
//         type:Number, // how many times coupon can be used by single user
//         required:true,
//         default:1
//     }
// })

const CouponSchema = new mongoose.Schema({
    CouponCode: {
        type: String,
        required: true,
        unique: true
    },
    CouponType: {
        type: String, // FIXED_CART,FIXED_PRODUCT
        required: true
    },
    CouponAmount: {
        type: Number,
        required: true,
    },
    CouponDescription: {
        type: String,
    },
    CouponStartDate: {
        type: Date,
        required: true,
        default: new Date()
    },
    CouponEndDate: {
        type: Date,
        required: true,
    },
    CouponLimit: {
        type: Number,
        required: true
    },
    CouponUsed: {
        type: Number,
        required: true,
        default: 0
    },
    CouponLimitPerUser: {
        type: Number,
        required: true,
        default: 1
    },
    Products: {
        type: Array,
        default: []
    },
    Categories: {
        type: Array,
        default: []
    },
    CouponExcludedProducts: {
        type: Array,
        default: []
    },
    CouponExcludedCategories: {
        type: Array,
        default: []
    },
    FreeShipping: {
        type: Boolean,
        required: true,
        default: false
    },
    MinimumSpendAmount: {
        type: Number,
        required: true,
        default: 0
    }
})

const CouponModel = mongoose.model("coupons", CouponSchema);
module.exports = CouponModel;
