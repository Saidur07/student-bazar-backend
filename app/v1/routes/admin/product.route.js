const express = require("express");
const router = express();
const { upload } = require("../../middlewares/multer");
const fs = require("fs");
const UploadToStorage = require("../../utility/file-upload");
const ProductModel = require("../../models/product.model");
const { GenerateUniqueId } = require("../../utility/unique-id-generator");
const AdminLogModel = require("../../models/admin-log.model");
const deleteFile = require("../../utility/delete-file");
const { PERMS } = require("../../constant");

const HasPerm = (req, res, next) => {
  try {
    /// check if same element exist in 2 arrays
    const hasPerm = req?.admin.Permissions?.some((item) =>
      PERMS.PRODUCT_MANAGE_PERMISSIONS.includes(item)
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
 * /api/v1/admin/product/create_new:
 *  post:
 *    tags: [admin-product]
 *    description: add new product
 *    parameters:
 *      - in: formData
 *        name: SKU
 *      - in: formData
 *        name: ProductTitle
 *      - in: formData
 *        name: ProductBanglishTitle
 *      - in: formData
 *        name: ProductDesc
 *      - in: formData
 *        name: ProductType
 *        type: select
 *        enum: [ACADEMIC_BOOK, SUBJECT_BOOK, STATIONARY, FASHION]
 *      - in: formData
 *        name: Categories
 *      - in: formData
 *        name: QuantityPerUnit
 *      - in: formData
 *        name: RegularPrice
 *      - in: formData
 *        name: SalePrice
 *      - in: formData
 *        name: UnitWeight
 *      - in: formData
 *        name: UnitInStock
 *      - in: formData
 *        name: ProductAvailable
 *        type: boolean
 *      - in: formData
 *        name: Picture
 *        type: file
 *      - in: formData
 *        name: PublicationID
 *      - in: formData
 *        name: AuthorID
 *      - in: formData
 *        name: BrandID
 *      - in: formData
 *        name: CustomAttributes
 *      - in: formData
 *        name: Tags
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */

router.post(
  "/create_new",
  HasPerm,
  upload.none(),
  async (req, res) => {
    try {
      const {
        ProductTitle,
        Tags,
        CustomAttributes,
        ProductType,
        Categories,
        PublicationID,
        AuthorID,
        BrandID,
        RegularPrice,
        SalePrice,
      } = req.body;
      const CategoryID = JSON.parse(Categories);

      if (CategoryID?.length == 0 || !CategoryID) {
        return res
          .status(400)
          .json({ message: "Please select atleast one category" });
      }

      if (!ProductType) {
        throw new Error("ProductType is required");
      }
      switch (ProductType) {
        case "SUBJECT_BOOK":
          if (!PublicationID || !AuthorID) {
            throw new Error("PublicationID, AuthorID are required");
          }
          break;
        case "ACADEMIC_BOOK":
          if (!PublicationID || !AuthorID) {
            throw new Error("PublicationID, AuthorID are required");
          }
          break;
        case "STATIONARY":
          if (!BrandID) {
            throw new Error("BrandID is required");
          }
          break;

        case "FASHION":
          if (!BrandID) {
            throw new Error("BrandID is required");
          }
          break;

        default:
          throw new Error("ProductType not found");
      }

      const ProductID = GenerateUniqueId()
      const PhotoInfo = req.body.Picture
      const URLSlug =
        ProductTitle.replaceAll(" ", "-") +
        "-" +
        Math.floor(Math.random() * 10000);

      const result = await ProductModel.create({
        ...req.body,
        Tags: Tags?.split(","),
        CustomAttributes:
          JSON.parse(CustomAttributes).length > 0
            ? JSON.parse(CustomAttributes)
            : [],
        URLSlug: URLSlug,
        LastUpdated: Date.now(),
        Picture: PhotoInfo,
        ProductID: ProductID,
        Deleted: false,
        CategoryID: CategoryID,
        DiscountAvailable: RegularPrice == SalePrice,
      });

      // admins action log
      const admin_action = `Product Added: ${ProductTitle}`;
      const admin_act_desc = `ProductID: ${ProductID}`;
      const admin_username = req.decodedToken.username;
      await AdminLogModel.create({
        username: admin_username,
        action: admin_action,
        action_desc: admin_act_desc,
      });
      res.status(200).json({ status: 200, data: result });
    } catch (e) {
      res.status(400).json({ status: 400, message: e.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/admin/product/edit:
 *  post:
 *    tags: [admin-product]
 *    description: edit product
 *    parameters:
 *      - in: formData
 *        name: ProductID
 *      - in: formData
 *        name: SKU
 *      - in: formData
 *        name: ProductTitle
 *      - in: formData
 *        name: ProductBanglishTitle
 *      - in: formData
 *        name: ProductDesc
 *      - in: formData
 *        name: ProductType
 *      - in: formData
 *        name: CategoryID
 *      - in: formData
 *        name: QuantityPerUnit
 *      - in: formData
 *        name: RegularPrice
 *      - in: formData
 *        name: SalePrice
 *      - in: formData
 *        name: UnitWeight
 *      - in: formData
 *        name: UnitInStock
 *      - in: formData
 *        name: ProductAvailable
 *        type: boolean
 *      - in: formData
 *        name: Picture
 *        type: file
 *      - in: formData
 *        name: PublicationID
 *      - in: formData
 *        name: AuthorID
 *      - in: formData
 *        name: BrandID
 *      - in: formData
 *        name: CustomAttributes
 *      - in: formData
 *        name: Tags
 *      - in: formData
 *        name: Categories
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.post("/edit", HasPerm, upload.none(), async (req, res) => {
  try {
    const {
      ProductID,
      BrandID,
      ProductTitle,
      ProductBanglishTitle,
      ProductDesc,
      QuantityPerUnit,
      RegularPrice,
      SalePrice,
      UnitWeight,
      UnitInStock,
      ProductAvailable,
      DiscountAvailable,
      Note,
      Tags,
      PublicationID,
      AuthorID,
      TotalPage,
      ISBNNumber,
      Edition,
      CustomAttributes,
      URLSlug,
      Categories,
      Picture,
    } = req.body;

    const data = await ProductModel.findOne({ ProductID: ProductID });
    if (data?.Deleted) {
      throw new Error("Product is deleted");
    }
    const updatedPicture = req.body?.Picture;
    const newTags = JSON.parse(Tags);

    const new_data = {
      ProductTitle: ProductTitle ? ProductTitle : data.ProductTitle,
      ProductBanglishTitle: ProductBanglishTitle
        ? ProductBanglishTitle
        : data.ProductBanglishTitle,
      ProductDesc: ProductDesc ? ProductDesc : data.ProductDesc,
      CategoryID: Categories?.length !== 0 ? Categories : data.CategoryID,
      QuantityPerUnit: QuantityPerUnit ? QuantityPerUnit : data.QuantityPerUnit,
      RegularPrice: RegularPrice ? RegularPrice : data.RegularPrice,
      SalePrice: SalePrice ? SalePrice : data.SalePrice,
      UnitWeight: UnitWeight ? UnitWeight : data.UnitWeight,
      UnitInStock: UnitInStock ? UnitInStock : data.UnitInStock,
      ProductAvailable: ProductAvailable
        ? ProductAvailable
        : data.ProductAvailable,
      DiscountAvailable: DiscountAvailable
        ? DiscountAvailable
        : data.DiscountAvailable,
      Note: Note ? Note : data.Note,
      Tags: newTags ? newTags : data.Tags,
      PublicationID: PublicationID ? PublicationID : data.PublicationID,
      AuthorID: AuthorID ? AuthorID : data.AuthorID,
      BrandID: BrandID ? BrandID : data.BrandID,
      TotalPage: TotalPage ? TotalPage : data.TotalPage,
      ISBNNumber: ISBNNumber ? ISBNNumber : data.ISBNNumber,
      Edition: Edition ? Edition : data.Edition,
      CustomAttributes: JSON.parse(CustomAttributes)
        ? JSON.parse(CustomAttributes)
        : data.CustomAttributes,
      URLSlug: URLSlug ? URLSlug : data.URLSlug,
    };

    if (updatedPicture && updatedPicture !== data.Picture) {
      new_data.Picture = updatedPicture;
      await deleteFile(data.Picture);
    }

    const updated_data = await ProductModel.findOneAndUpdate(
      { ProductID: ProductID },
      new_data,
      { new: true }
    );

    // admins action log
    const admin_action = `Product Edited`;
    const admin_act_desc = `ProductID: ${ProductID}`;
    const admin_username = req.decodedToken.username;
    await AdminLogModel.create({
      username: admin_username,
      action: admin_action,
      action_desc: admin_act_desc,
    });

    res.status(200).json({
      status: 200,
      updated_data: updated_data,
    });
  } catch (e) {
    res.status(400).json({ status: 400, message: e.message });
  } finally {
  }
});
/**
 * @swagger
 * /api/v1/admin/product/upload-product-pdf:
 *  post:
 *    tags: [admin-product]
 *    description: add pdf file to product
 *    parameters:
 *      - in: formData
 *        name: BookPDF
 *        type: file
 *      - in: formData
 *        name: ProductID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.post(
  "/upload-product-pdf",
  HasPerm,
  upload.single("BookPDF"),
  async (req, res) => {
    try {
      const { ProductID } = req.body;
      const data = await ProductModel.findOne({ ProductID: ProductID });
      console.log(data);
      if (!data?.ProductID) {
        throw new Error("Product doesnot exist");
      }

      if (req.file?.mimetype !== "application/pdf") {
        throw new Error("Only pdf file is allowed");
      }

      const PhotoInfo = await UploadToStorage(req?.file?.path);
      const { bucket, name } = PhotoInfo[0].metadata;
      const url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${name}?alt=media`;
      const new_data = {
        BookPDF: url,
      };
      const updated_data = await ProductModel.findOneAndUpdate(
        { ProductID: ProductID },
        new_data,
        { new: true }
      );
      if (data?.BookPDF) {
        await deleteFile(data?.BookPDF);
      }
      fs.unlinkSync(req.file?.path);
      res.status(200).json({
        status: 200,
        updated_data: updated_data,
      });
    } catch (e) {
      fs.unlinkSync(req.file?.path);
      res.status(400).json({ status: 400, message: e.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/admin/product/:
 *  get:
 *    tags: [admin-product]
 *    description: edit product
 *    parameters:
 *      - in: formData
 *        name: ProductID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.get("/", HasPerm, upload.none(), async (req, res) => {
  try {
    const { ProductID } = req.body;
    const data = await ProductModel.findOne({ ProductID });
    res.status(200).json({
      status: 200,
      data: data,
    });
  } catch (e) {
    res.status(400).json({
      status: 400,
      messege: e.message,
    });
  }
});

/**
 * @swagger
 * /api/v1/admin/product/delete:
 *  post:
 *    tags: [admin-product]
 *    description: delete product
 *    parameters:
 *      - in: formData
 *        name: ProductID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 *
 */
router.post("/delete", HasPerm, upload.none(), async (req, res) => {
  try {
    const { ProductID } = req.body;

    const product = await ProductModel.findOne({ ProductID });

    if (!product?.ProductID) {
      throw new Error("Product not found");
    }

    const data = await ProductModel.findOneAndDelete({ ProductID });
    await deleteFile(product?.Picture);

    // admins action log
    const admin_action = `Product deleted: ${data.ProductTitle}`;
    const admin_act_desc = `ProductID: ${ProductID}`;
    const admin_username = req.decodedToken.username;
    await AdminLogModel.create({
      username: admin_username,
      action: admin_action,
      action_desc: admin_act_desc,
    });

    res.status(200).json({
      status: 200,
      data: data,
    });
  } catch (e) {
    res.status(400).json({
      status: 400,
      messege: e.message,
    });
  }
});

module.exports = router;
