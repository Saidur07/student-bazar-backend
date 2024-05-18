const express = require("express");
const router = express();
// middlewares
const { upload } = require("../../middlewares/multer");
// database models
const CouponModel = require("../../models/coupon.model");
const AdminLogModel = require("../../models/admin-log.model");
const { PERMS, COUPON_TYPES } = require("../../constant");

const HasPerm = (req, res, next) => {
  try {
    /// check if same element exist in 2 arrays
    const hasPerm = req?.admin.Permissions?.some((item) =>
      PERMS.ADMIN_MANAGE_PERMISSIONS.includes(item)
    );
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
 * /api/v1/admin/coupon/all:
 *  get:
 *    tags: [admin-coupon]
 *    description: get all coupons
 *    responses:
 *     '200':
 *      description: success
 *     '400':
 *      description: failed
 *
 */

router.get("/all", HasPerm, async (req, res) => {
  try {
    const coupons = await CouponModel.find({});
    res.status(200).json({
      success: true,
      coupons,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/coupon/single/{CouponCode}:
 *  get:
 *    tags: [admin-coupon]
 *    description: get all coupons
 *    parameters:
 *     - in: path
 *       name: CouponCode
 *    responses:
 *     '200':
 *      description: success
 *     '400':
 *      description: failed
 *
 */

router.get("/single/:CouponCode", HasPerm, async (req, res) => {
  try {
    const coupon = await CouponModel.findOne({
      CouponCode: req.params.CouponCode,
    });
    res.status(200).json({
      success: true,
      coupon,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/coupon/new:
 *  post:
 *    tags: [admin-coupon]
 *    description: create coupon
 *    parameters:
 *      - in: formData
 *        name: CouponCode
 *      - in: formData
 *        name: CouponType
 *        type: select
 *        enum: [FIXED_CART,FIXED_PRODUCT]
 *      - in: formData
 *        name: CouponAmount
 *      - in: formData
 *        name: CouponDescription
 *      - in: formData
 *        name: CouponStartDate
 *        type: date
 *      - in: formData
 *        name: CouponEndDate
 *        type: date
 *      - in: formData
 *        name: CouponLimit
 *      - in: formData
 *        name: CouponLimitPerUser
 *      - in: formData
 *        name: ProductIds
 *      - in: formData
 *        name: CategoryIds
 *      - in: formData
 *        name: CouponExcludedProducts
 *      - in: formData
 *        name: CouponExcludedCategories
 *      - in: formData
 *        name: FreeShipping
 *        type: boolean
 *      - in: formData
 *        name: MinimumSpendAmount
 *    responses:
 *     '200':
 *      description: success
 *     '400':
 *      description: failed
 *
 */

router.post("/new", HasPerm, upload.none(), async (req, res) => {
  try {
    const {
      CouponCode,
      CouponType,
      CouponAmount,
      CouponDescription,
      CouponStartDate,
      CouponEndDate,
      CouponLimit,
      CouponLimitPerUser,
      ProductIds,
      CategoryIds,
      CouponExcludedProducts,
      CouponExcludedCategories,
      FreeShipping,
      MinimumSpendAmount
    } = req.body;

    // check if coupon type is valid
    const isValidType = COUPON_TYPES.includes(CouponType);
    if (!isValidType) {
      return res.status(400).json({
        message: "Invalid coupon type",
      });
    }

    // check if coupon code already exist
    const exist = await CouponModel.findOne({ CouponCode });
    if (exist?.CouponCode) {
      return res.status(400).json({
        message: "Coupon code already exist",
      });
    }

    // CouponAmount should be greater than 0
    if (Number(CouponAmount) <= 0) {
      return res.status(400).json({
        message: "Coupon amount should be greater than 0",
      });
    }

    // CouponLimit should be greater than 0
    if (Number(CouponLimit) <= 0) {
      return res.status(400).json({
        message: "Coupon limit should be greater than 0",
      });
    }

    // CouponLimitPerUser should be greater than 0
    if (Number(CouponLimitPerUser) <= 0) {
      return res.status(400).json({
        message: "Coupon limit per user should be greater than 0",
      });
    }

    // CouponStartDate should be less than CouponEndDate
    if (new Date(CouponStartDate) > new Date(CouponEndDate)) {
      return res.status(400).json({
        message: "Coupon start date should be less than end date",
      });
    }

    const coupon = await CouponModel.create({
      CouponCode,
      CouponType,
      CouponAmount,
      CouponDescription,
      CouponStartDate,
      CouponEndDate,
      CouponLimit,
      CouponLimitPerUser,
      Products: JSON.parse(ProductIds),
      Categories: JSON.parse(CategoryIds),
      CouponExcludedProducts: JSON.parse(CouponExcludedProducts),
      CouponExcludedCategories: JSON.parse(CouponExcludedCategories),
      FreeShipping: JSON.parse(FreeShipping),
      MinimumSpendAmount
    });

    res.status(200).json({ status: 200, coupon: coupon });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/coupon/edit:
 *  post:
 *    tags: [admin-coupon]
 *    description: edit coupon
 *    parameters:
 *      - in: formData
 *        name: CouponCode
 *      - in: formData
 *        name: CouponType
 *        type: select
 *        enum: [FIXED_CART,FIXED_PRODUCT]
 *      - in: formData
 *        name: CouponAmount
 *      - in: formData
 *        name: CouponDescription
 *      - in: formData
 *        name: CouponStartDate
 *        type: date
 *      - in: formData
 *        name: CouponEndDate
 *        type: date
 *      - in: formData
 *        name: CouponLimit
 *      - in: formData
 *        name: CouponLimitPerUser
 *      - in: formData
 *        name: ProductIds
 *      - in: formData
 *        name: CategoryIds
 *      - in: formData
 *        name: CouponExcludedProducts
 *      - in: formData
 *        name: CouponExcludedCategories
 *      - in: formData
 *        name: FreeShipping
 *        type: boolean
 *      - in: formData
 *        name: MinimumSpendAmount
 *    responses:
 *     '200':
 *      description: success
 *     '400':
 *      description: failed
 *
 */

router.post("/edit", HasPerm, upload.none(), async (req, res) => {
  try {
    const { CouponCode } = req.body;

    const exist = await CouponModel.findOne({ CouponCode });
    if (!exist?.CouponCode) {
      return res.status(400).json({
        message: "Coupon code does not exist",
      });
    }

    const coupon = await CouponModel.findOneAndUpdate(
      { CouponCode },
      {
        ...req.body,
        CouponType: exist.CouponType,
      },
      { new: true }
    );

    res.status(200).json({ status: 200, coupon: coupon });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  }
});

/**
 * @swagger
 * /api/v1/admin/coupon/delete/{CouponCode}:
 *  delete:
 *    tags: [admin-coupon]
 *    description: edit coupon
 *    parameters:
 *      - in: path
 *        name: CouponCode
 *    responses:
 *     '200':
 *      description: success
 *     '400':
 *      description: failed
 *
 */
router.delete(
  "/delete/:CouponCode",
  HasPerm,
  upload.none(),
  async (req, res) => {
    try {
      const { CouponCode } = req.params;
      const exist = await CouponModel.findOne({ CouponCode });
      if (!exist?.CouponCode) {
        return res.status(400).json({
          message: "Coupon code does not exist",
        });
      }

      await CouponModel.findOneAndDelete({ CouponCode });

      res
        .status(200)
        .json({ status: 200, message: "Coupon deleted successfully" });
    } catch (e) {
      res.status(400).json({ status: 400, message: e.message });
    }
  }
);

module.exports = router;
