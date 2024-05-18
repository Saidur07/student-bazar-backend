const ProductModel = require("../models/product.model");
const AddressModel = require("../models/address.model");
const DistrictModel = require("../models/districts.model");
const CouponModel = require("../models/coupon.model");

const CouponChecker = async ({ Products, CouponCode }) => {
    const coupon_data = await CouponModel.findOne({ CouponCode });
    if (!coupon_data?.CouponCode) {
        return {
            status: false,
            DiscountMessage: 'Coupon code is not valid',
            DiscountAmount: 0,
        }
    }
    const AllProducts = await Promise.all(
        Products.map(async (product) => {
            const Product = await ProductModel.findOne({ ProductID: product.ProductID });
            return {
                ...product,
                ...Product._doc,
            };
        }))
    if (coupon_data?.CouponType == "FIXED_CART") {
        const totalPrice = 0;
        forEach(AllProducts, (product) => {
            totalPrice += Number(product.SalePrice) * Number(product.Quantity);
        })
        if (!totalPrice >= coupon_data?.MinimumSpendAmount) {
            return {
                status: false,
                DiscountAmount: coupon_data?.CouponAmount,
                DiscountType: coupon_data?.CouponType,
                DiscountMessage: "Minimum spend amount is not reached",
            }
        }

        return {
            DiscountAmount: coupon_data?.CouponAmount,
            DiscountType: coupon_data?.CouponType,
            DiscountMessage: "Coupon applied",
            status: true
        }
    }
    if (coupon_data?.CouponType == "FIXED_PRODUCT") {
        const matched_product = AllProducts.find((product) => {
            return coupon_data?.CouponProductIds.includes(product.ProductID)
        })
        if (matched_product) {
            return {
                DiscountAmount: coupon_data?.CouponAmount,
                DiscountType: coupon_data?.CouponType,
                DiscountMessage: "Coupon applied",
                status: true
            }
        }
    }

    return {
        status: false,
        DiscountMessage: 'Something went wrong',
        DiscountAmount: 0
    }


}

const CalculatePrice = async ({ Products, AddressID, GiftWrap = false, CouponCode }) => {
    const AllProducts = await Promise.all(
        Products.map(async (product) => {
            try {
                if (!product.ProductID || !product.Quantity) {
                    throw new Error("ProductID and Quantity are required");
                }
                const ProductData = await ProductModel.findOne({
                    ProductID: product.ProductID,
                });

                if (!ProductData) {
                    throw new Error("Product not found");
                }
                if (ProductData.UnitInStock < product.Quantity) {
                    throw new Error("Product quantity is not enough");
                }
                return {
                    ProductID: ProductData.ProductID,
                    ProductTitle: ProductData.ProductTitle,
                    ProductImage: ProductData.Picture,
                    Quantity: product.Quantity,
                    RegularPrice: ProductData.RegularPrice,
                    SalePrice: ProductData.SalePrice,
                    TotalPrice: product.Quantity * ProductData.SalePrice,
                    UnitWeight: ProductData.UnitWeight,
                    UnitInStock: ProductData.UnitInStock,
                    BrandID: ProductData?.BrandID,
                    PublicationID: ProductData?.PublicationID,
                    ProductType: ProductData?.ProductType
                };
            } catch (e) {
                throw new Error(e.message);
            }
        })
    );

    const price = AllProducts.reduce((total, product) => {
        return total + product.TotalPrice;
    }, 0);

    let CouponData;
    if (CouponCode) {
        CouponData = await CouponChecker({ Products: AllProducts, CouponCode });
    }

    const Address = await AddressModel.findOne({ AddressID });
    const district_data = await DistrictModel.findOne({ district_id: Address?.DistrictID })
    const delivery_fee = district_data?.shipping_fee ? district_data?.shipping_fee : 0;
    const GiftWrapCharge = GiftWrap == true || GiftWrap == "true" ? 20 : 0

    const CouponDiscount = CouponData?.status ? Number(CouponData?.DiscountAmount) : 0;
    const data = {
        Products: AllProducts,
        Address: Address,
        Price: price,
        CouponData,
        DeliveryCharge: delivery_fee,
        GiftWrapCharge: GiftWrapCharge,
        TotalPrice: price + delivery_fee + GiftWrapCharge - CouponDiscount,
        CouponDiscount: CouponDiscount,
        CouponCode: CouponCode ? CouponCode : null,
        GiftWrap: GiftWrap,
        AllProducts
    };

    return data
}

module.exports = { CalculatePrice };