const express = require("express");
const router = express();
const { upload } = require("../../middlewares/multer");
const contstant = require("../../constant");
const { CalculatePrice } = require("../../utility/price-calculator");
const OrderModel = require("../../models/order.model");
const { GenerateUniqueId } = require("../../utility/unique-id-generator");
const ProductModel = require("../../models/product.model");
const PublicationModel = require("../../models/publication.model");
const BrandModel = require("../../models/brand.model");
const { PERMS } = require('../../constant')
const moment = require("moment");

const HasPerm = (req, res, next) => {
  try {
    /// check if same element exist in 2 arrays
    const hasPerm = req?.admin.Permissions?.some((item) => PERMS.ORDER_MANAGE_PERMISSIONS.includes(item));
    if (hasPerm) {
      console.log("HasPerm");
      next();
    } else

      res.status(403).json({
        success: false,
        message: "Access Denied",
      });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/admin/order/get_orders:
 *  get:
 *    tags: [admin-order]
 *    description: get_orders
 *    parameters:
 *      - in: query
 *        name: page
 *      - in: query
 *        name: limit
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.get("/get_orders", HasPerm, upload.none(), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const ProductsData = req.query?.Products ? JSON?.parse(req.query?.Products) : undefined;
    const data = !ProductsData ? await OrderModel.find({ ...req.query }) : await OrderModel.find({ ...req.query, Products: { $elemMatch: ProductsData } })
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json({ status: 200, orders: data });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/order/order_status:
 *  get:
 *    tags: [admin-order]
 *    description: order_status
 *    parameters:
 *      - in: query
 *        name: page
 *      - in: query
 *        name: limit
 *      - in: query
 *        name: date
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.get('/order_status', HasPerm, upload.none(), async (req, res) => {
  try {
    const { page = 1, limit = 20, date = moment().format('DD-MM-YYYY') } = req.query;
    const ProductsData = req.query?.Products ? JSON?.parse(req.query?.Products) : undefined;

    const data = !ProductsData ?
      await OrderModel.find({ ...req.query, OrderCreatedAt: { $gte: new Date(moment(date, "DD-MM-YYYY")), $lt: new Date(moment(date, 'DD-MM-YYYY').add(1, 'days')) } }) :
      await OrderModel.find({ ...req.query, Products: { $elemMatch: ProductsData }, OrderCreatedAt: { $gte: new Date(moment(date, "DD-MM-YYYY")), $lt: new Date(moment(date, 'DD-MM-YYYY').add(1, 'days')) } })
        .skip((page - 1) * limit)
        .limit(limit)


    const productIDs = data?.map((item) => item?.Products?.map((item) => item?.ProductID))?.flat();
    const AllProducts = await ProductModel.find({
      ProductID: { $in: productIDs },
    })

    let ProductsWithOrderDetails = data?.map((item) => {
      const Products = item?.Products?.map((product) => {
        const Product = AllProducts?.find((item) => item?.ProductID === product?.ProductID);
        const OrderData = data?.find((d) => d?.OrderID === item?.OrderID);
        console.log(OrderData._doc.Products.find((item) => item?.ProductID === product?.ProductID))
        return {
          ...Product._doc,
          ...OrderData.Products.find((item) => item?.ProductID === product?.ProductID)._doc,
          OrderData: { ...OrderData._doc, Products: undefined, ShippingAddress: undefined, BillingAddress: undefined }
        }
      })
      return Products
    }).flat()


    const publicationIDs = data?.map((item) => item?.Products?.map((item) => item?.PublicationID))?.flat();
    const AllPublications = await PublicationModel.find({
      PublicationID: { $in: publicationIDs },
    })

    const brandIDs = data?.map((item) => item?.Products?.map((item) => item?.BrandID))?.flat();
    const AllBrands = await BrandModel.find({
      BrandID: { $in: brandIDs },
    })

    let finalData = []

    for (let i = 0; i < AllPublications.length; i++) {
      const pub = AllPublications[i];
      const products = ProductsWithOrderDetails?.filter((item) => item?.PublicationID == pub?.PublicationID);

      finalData.push({
        ...pub._doc,
        Products: products
      })
    }

    for (let i = 0; i < AllBrands.length; i++) {
      const brand = AllBrands[i];
      const products = ProductsWithOrderDetails?.filter((item) => item?.BrandID == brand?.BrandID);

      finalData.push({
        ...brand._doc,
        Products: products
      })
    }

    res.status(200).json({ status: 200, data: finalData });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
})


/**
 * @swagger
 * /api/v1/admin/order/update_order_status:
 *  post:
 *    tags: [admin-order]
 *    description: update_order_status
 *    parameters:
 *      - in: formData
 *        name: OrderID
 *      - in: formData
 *        name: OrderStatus
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post("/update_order_status", HasPerm, upload.none(), async (req, res) => {
  try {
    const { OrderID, OrderStatus } = req.body;
    const order_data = await OrderModel.findOne({ OrderID });

    if (!order_data.OrderID) {
      throw new Error("Order not found");
    }

    const status = contstant.OrderStatus

    if (!status.includes(OrderStatus)) {
      throw new Error("Invalid Order Status");
    }

    const new_data = await OrderModel.findOneAndUpdate(
      { OrderID },
      {
        OrderStatus: OrderStatus,
        $push: { OrderTracking: { Status: OrderStatus, Date: Date.now() } },
      },
      { new: true }
    );
    res
      .status(200)
      .json({ status: 200, message: "Successful", data: new_data });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});


/**
 * @swagger
 * /api/v1/admin/order/update_advance_amount:
 *  post:
 *    tags: [admin-order]
 *    description: update_advance_amount
 *    parameters:
 *      - in: formData
 *        name: OrderID
 *      - in: formData
 *        name: AdvanceAmount
 *      - in: formData
 *        name: TrxID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post("/update_advance_amount", HasPerm, upload.none(), async (req, res) => {
  try {
    const { OrderID, AdvanceAmount, TrxID } = req.body;
    const OrderData = await OrderModel.findOne({ OrderID });
    const OrderDataWithTrxID = await OrderModel.findOne({ TrxID });
    let COD = true;
    if (OrderDataWithTrxID?.TrxID) {
      throw new Error("TrxID already exists");
    }
    if (OrderData.TrxID !== TrxID) {
      throw new Error("Invalid TrxID");
    }
    if (OrderData.TotalPrice - AdvanceAmount <= 0) {
      COD = false;
    }

    const new_data = await OrderModel.findOneAndUpdate(
      { OrderID },
      { AdvancePaid: AdvanceAmount, COD },
      { new: true }
    );
    res
      .status(200)
      .json({ status: 200, message: "Successful", data: new_data });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});



/**
 * @swagger
 * /api/v1/admin/order/cancel_order:
 *  post:
 *    tags: [admin-order]
 *    description: cancel_order
 *    parameters:
 *      - in: formData
 *        name: OrderID
 *      - in: formData
 *        name: Reason
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post("/cancel_order", HasPerm, upload.none(), async (req, res) => {
  try {
    const { OrderID, Reason } = req.body;

    const orderData = await OrderModel.findOne({ OrderID });

    const data = {
      OrderStatus: "CANCELED_BY_SELLER",
      Cancelled: true,
      CancellationReason: Reason,
      CancelledAt: Date.now(),
      Refunded: Number(orderData.AdvancePaid) === 0 ? true : false,
    };

    const new_data = await OrderModel.findOneAndUpdate(
      { OrderID },
      { ...data, $push: { OrderTracking: { Status: data.OrderStatus, Date: Date.now() } } },
      { new: true }
    );
    res
      .status(200)
      .json({ status: 200, message: "Successful", data: new_data });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});


/**
 * @swagger
 * /api/v1/admin/order/mark_order_as_refunded:
 *  post:
 *    tags: [admin-order]
 *    description: mark_order_as_refunded
 *    parameters:
 *      - in: formData
 *        name: OrderID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post("/mark_order_as_refunded", HasPerm, upload.none(), async (req, res) => {
  try {
    const { OrderID } = req.body;

    const order_data = await OrderModel.findOne({ OrderID });
    if (order_data?.Refunded) {
      throw new Error("Order already marked as refunded");
    }
    if (!order_data?.Cancelled) {
      throw new Error("Order is not cancelled");
    }

    const data = await OrderModel.findOneAndUpdate(
      { OrderID },
      { Refunded: true },
      { new: true }
    );
    res.status(200).json({ status: 200, message: "Successful", data: data });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/order/today:
 *  get:
 *    tags: [admin-order]
 *    description: todays order
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.get("/today", HasPerm, async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const data = await OrderModel.find({
      OrderCreatedAt: { $gte: startOfToday },
    });
    res.status(200).json({ status: 200, orders: data });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/order/custom_order:
 *  post:
 *    tags: [admin-order]
 *    description: todays order
 *    parameters:
 *     - in: formData
 *       name: FullName
 *     - in: formData
 *       name: PhoneNumber
 *     - in: formData
 *       name: Address
 *     - in: formData
 *       name: DivisionID
 *     - in: formData
 *       name: DistrictID
 *     - in: formData
 *       name: UpazilaID
 *     - in: formData
 *       name: AdvanceAmount
 *     - in: formData
 *       name: ShippingFee
 *     - in: formData
 *       name: Products
 *       type: array
 *     - in: formData
 *       name: TotalPrice
 *     - in: formData
 *       name: GiftWrap
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post('/custom_order', HasPerm, upload.none(), async (req, res) => {
  try {
    const {
      FullName,
      PhoneNumber,
      Address,
      DivisionID,
      DistrictID,
      UpazilaID,
      AdvanceAmount,
      ShippingFee,
      Products,
      GiftWrap = false,
    } = req.body

    const AddressData = {
      FullName,
      PhoneNumber,
      Address,
      DivisionID,
      DistrictID,
      UpazilaID,
      ReceiveAt: 1
    }

    const calcultedPrice = await CalculatePrice({ Products: JSON.parse(Products), GiftWrap })
    const orderSeq = GenerateUniqueId()
    const OrderData = {
      OrderID: orderSeq,
      OrderCreatedAt: Date.now(),
      OrderStatus: "PENDING",
      OrderTracking: [{ Status: "PENDING", Date: Date.now() }],
      ShippingAddress: AddressData,
      BillingAddress: AddressData,
      AdvancePaid: AdvanceAmount,
      Price: calcultedPrice.Price,
      TotalPrice: calcultedPrice.TotalPrice + Number(ShippingFee),
      DeliveryCharge: ShippingFee,
      COD: calcultedPrice.TotalPrice - AdvanceAmount <= 0 ? false : true,
      GiftWrap,
      Products: calcultedPrice.Products,
      CustomOrder: true,
      CustomerID: req.admin.AdminID,
      CustomPlacedOrder: true,
      GiftWrap: GiftWrap
    }

    const newOrder = await OrderModel.create(OrderData)
    res.status(200).json({ status: 200, message: "Successful", data: newOrder })
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message })
  }
})

module.exports = router;
