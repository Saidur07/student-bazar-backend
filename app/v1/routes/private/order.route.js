const express = require("express");
const router = express();
const OrderModel = require("../../models/order.model");
const { upload } = require("../../middlewares/multer");
const ProductModel = require("../../models/product.model");
const DistrictsModel = require("../../models/districts.model");
const AddressModel = require("../../models/address.model");
const { GenerateUniqueId } = require('../../utility/unique-id-generator')
const CartModel = require("../../models/cart.model");
const { CalculatePrice } = require("../../utility/price-calculator");
const { PaymentMethods } = require("../../constant");

/**
 * @swagger
 * /api/v1/private/order/place_order:
 *  post:
 *    tags: [private-order]
 *    description: place order
 *    parameters:
 *      - in: formData
 *        name: AddressID
 *      - in: formData
 *        name: PaymentMethod
 *      - in: formData
 *        name: COD
 *        type: boolean
 *      - in: formData
 *        name: CouponCode
 *      - in: formData
 *        name: GiftWrap
 *        type: boolean
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post("/place_order", upload.none(), async (req, res) => {
    try {
        let { AddressID, PaymentMethod, COD, CouponCode, GiftWrap } = req.body;

        const CartData = await CartModel.findOne({
            CustomerID: req.decodedToken.CustomerID,
        });
        const Products = CartData?.toJSON()?.Items
            ? CartData.toJSON().Items.filter((item) => item.Selected == true)
            : [];

        if (!Products.length || !AddressID || !PaymentMethod || COD === null) {
            throw new Error("Products, AddressID, PaymentMethod & COD are required");
        }

        if (!PaymentMethods.includes(PaymentMethod)) {
            throw new Error("PaymentMethod is not valid");
        }

        if (PaymentMethod == "COD" && JSON.parse(COD) == false) {
            throw new Error("COD is not valid");
        }

        const price_data = await CalculatePrice({ Products, AddressID, CouponCode, GiftWrap })

        const orderSeq = GenerateUniqueId()
        const OrderData = {
            OrderID: orderSeq,
            Products: price_data?.AllProducts,
            CustomerID: req.decodedToken.CustomerID,
            ShippingAddress: price_data?.Address,
            BillingAddress: price_data?.Address,
            Gift: false,
            Price: price_data?.Price,
            DeliveryCharge: price_data?.DeliveryCharge,
            TotalPrice: price_data?.TotalPrice,
            PaymentMethod: PaymentMethod,
            COD: JSON.parse(COD),
            GiftWrap: price_data?.GiftWrap,
            CouponCode: price_data?.CouponCode,
            CouponDiscount: price_data?.CouponDiscount,
        };

        await Promise.all(
            Products.map(async (product) => {
                try {
                    return await ProductModel.findOneAndUpdate(
                        { ProductID: product.ProductID },
                        { $inc: { UnitInStock: -product.Quantity } }
                    );
                } catch (e) {
                    throw new Error(e.message);
                }
            })
        );

        const data = await OrderModel.create(OrderData);
        await CartModel.findOneAndUpdate({ CustomerID: req.decodedToken.CustomerID }, { Items: [] });

        res.status(200).json({ status: 200, OrderData: data });
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message });
    }
});

/**
 * @swagger
 * /api/v1/private/order/order_as_gift:
 *  post:
 *   tags: [private-order]
 *   description: order as gift
 *   parameters:
 *      - in: query
 *        name: ShippingAddress
 *        type: object
 *      - in: query
 *        name: BillingAddress
 *        type: object
 *      - in: query
 *        name: CouponCode
 *        type: string
 *      - in: query
 *        name: GiftWrap
 *        type: boolean
 *      - in: query
 *        name: PaymentMethod
 *        type: string
 * 
 * 
*/
router.post('/order_as_gift', async (req, res) => {
    try {
        const { ShippingAddress, BillingAddress, CouponCode, GiftWrap, PaymentMethod } = req.body;

        if (!ShippingAddress || !BillingAddress || !PaymentMethod) {
            throw new Error("ShippingAddress, BillingAddress & PaymentMethod are required");
        }

        if (!PaymentMethods.includes(PaymentMethod)) {
            throw new Error("PaymentMethod is not valid");
        }

        const CartData = await CartModel.findOne({
            CustomerID: req.decodedToken.CustomerID,
        })
        const Products = CartData?.toJSON()?.Items ? CartData.toJSON().Items.filter(item => item.Selected == true) : [];

        if (!Products.length) {
            throw new Error("Products are required");
        }

        const price_data = await CalculatePrice({ Products, AddressID: ShippingAddress, CouponCode, GiftWrap })

        const orderSeq = GenerateUniqueId()
        const OrderData = {
            OrderID: orderSeq,
            Products: AllProducts,
            CustomerID: req.decodedToken.CustomerID,
            ShippingAddress: price_data?.Address,
            BillingAddress: price_data?.Address,
            Gift: true,
            Price: price_data?.Price,
            DeliveryCharge: price_data?.DeliveryCharge,
            TotalPrice: price_data?.TotalPrice,
            PaymentMethod: PaymentMethod,
            COD: false,
            GiftWrap: price_data?.GiftWrap,
            CouponCode: price_data?.CouponCode,
            CouponDiscount: price_data?.CouponDiscount
        }

        const data = await OrderModel.create(OrderData);
        await CartModel.findOneAndUpdate({ CustomerID: req.decodedToken.CustomerID }, { Items: [] });
        res.status(200).json({ order: data, status: 200 })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message });
    }
})

/**
 * @swagger
 * /api/v1/private/order/submit_trx_id:
 *  post:
 *    tags: [private-order]
 *    description: submit payment trx id
 *    parameters:
 *      - in: formData
 *        name: TrxID
 *      - in: formData
 *        name: OrderID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post("/submit_trx_id", upload.none(), async (req, res) => {
    try {
        const { TrxID, OrderID } = req.body;
        const { CustomerID } = req.decodedToken;

        const orders = await OrderModel.findOne({ TrxID });
        if (orders) {
            throw new Error("TrxID already used");
        }

        if (!TrxID || !OrderID) {
            throw new Error("TrxID and OrderID are required");
        }

        const orderData = await OrderModel.findOne({
            OrderID,
            CustomerID: CustomerID,
        });
        if (!orderData) {
            throw new Error("Order not found");
        }
        if (orderData?.TrxID) {
            throw new Error("TrxID already exists");
        }
        const OrderStatus = "PENDING";
        const data = await OrderModel.findOneAndUpdate(
            { OrderID, CustomerID: CustomerID },
            {
                OrderStatus: OrderStatus,
                TrxID,
                $push: { OrderTracking: { Status: OrderStatus } },
            },
            { new: true, upsert: true }
        );
        res.status(200).json({ status: 200, message: "Successful", data: data });
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message });
    }
});

/**
 * @swagger
 * /api/v1/private/order/all_orders:
 *  get:
 *    tags: [private-order]
 *    description: get all orders
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.get("/all_orders", upload.none(), async (req, res) => {
    try {
        const { CustomerID } = req.decodedToken;
        const data = await OrderModel.find({ CustomerID: CustomerID, ...req.query })
        res.status(200).json({ status: 200, orders: data });
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message });
    }
});

/**
 * @swagger
 * /api/v1/private/order/order_detail:
 *  get:
 *    tags: [private-order]
 *    description: get order detail
 *    parameters:
 *      - in: query
 *        name: OrderID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.get("/order_detail", upload.none(), async (req, res) => {
    try {
        const { OrderID } = req.query;
        const { CustomerID } = req.decodedToken;
        const data = await OrderModel.findOne({ OrderID, CustomerID: CustomerID });
        res.status(200).json({ status: 200, order_detail: data });
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message });
    }
});

/**
 * @swagger
 * /api/v1/private/order/checkout_info:
 *  get:
 *    tags: [private-order]
 *    description: get checkout info
 *    parameters:
 *      - in: query
 *        name: AddressID
 *      - in: query
 *        name: GiftWrap
 *      - in: query
 *        name: CouponCode
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.get("/checkout_info", upload.none(), async (req, res) => {
    try {
        const { CustomerID } = req.decodedToken;
        const { AddressID, GiftWrap = false, CouponCode } = req.query;

        const CartData = await CartModel.findOne({ CustomerID: CustomerID })
        const Items = CartData?.toJSON().Items ? CartData?.toJSON().Items.filter((i) => i.Selected === true) : []
        const AllProducts = await Promise.all(Items.map(async (product) => {
            try {
                const ProductData = await ProductModel.findOne({ ProductID: product?.ProductID })
                return {
                    ProductID: ProductData?.ProductID,
                    ProductTitle: ProductData?.ProductTitle,
                    ProductImage: ProductData?.Picture,
                    Quantity: product?.Quantity,
                    RegularPrice: ProductData?.RegularPrice,
                    SalePrice: ProductData?.SalePrice,
                    TotalPrice: product?.Quantity * ProductData?.SalePrice,
                    UnitWeight: ProductData?.UnitWeight,
                    UnitInStock: ProductData?.UnitInStock,
                    BrandID: ProductData?.BrandID,
                    PublicationID: ProductData?.PublicationID,
                    ProductType: ProductData?.ProductType
                }
            } catch (e) {
                throw new Error(e.message)
            }
        }))
        const price_data = await CalculatePrice({ AddressID, GiftWrap, Products: AllProducts, CouponCode })

        const data = {
            Price: price_data?.Price,
            DeliveryCharge: price_data?.DeliveryCharge,
            GiftWrapCharge: price_data?.GiftWrapCharge,
            TotalPrice: price_data?.TotalPrice,
            Items: AllProducts,
            ItemsCount: AllProducts.length
        }
        res.status(200).json({ status: 200, checkout_info: data });
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message });
    }
});

module.exports = router;