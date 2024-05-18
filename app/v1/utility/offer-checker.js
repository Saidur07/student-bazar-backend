const OfferModal = require("../models/offer.model");
const ProductModal = require("../models/product.model");

const checker = () => {
  // check if offer is valid for the given date every minute
  setInterval(async () => {
    const offers = await OfferModal.find();
    offers.forEach(async (offer) => {
      const { OfferStartingDate, OfferEndingDate } = offer;
      const currentDate = new Date();
      // If Offer Is Active
      if (currentDate >= OfferStartingDate && currentDate <= OfferEndingDate) {
        // If offer is active & offertype is PRODUCT but status is UPCOMING
        if (offer.OfferStatus === "UPCOMING" && offer.OfferType === "PRODUCT") {
          // Update Offer Status to ACTIVE
          await OfferModal.findOneAndUpdate(
            { OfferID: offer.OfferID },
            { OfferStatus: "ACTIVE" }
          );

          // Loop through products and update their price with the offer price
          offer.Products.forEach(async (product) => {
            // get offer ProductDetails
            const productDetails = await ProductModal.findOne({
              ProductID: product,
            });

            if (productDetails?.ProductID) {
              // calculate offer price
              const NewSalePrice =
                Math.floor(Number(productDetails.RegularPrice) -
                    (Number(productDetails.RegularPrice) *
                        Number(offer.DiscountPercent)) /
                    100)

              //update offer price
              await ProductModal.findOneAndUpdate(
                { ProductID: product },
                { SalePrice: NewSalePrice }
              );
            }
          });
          // If offer is active & offertype is SUBCATEGORY but status is UPCOMING
        } else if (
          offer.OfferStatus === "UPCOMING" &&
          offer.OfferType === "SUBCATEGORY"
        ) {
          // Update Offer Status to ACTIVE
          await OfferModal.findOneAndUpdate(
            { OfferID: offer.OfferID },
            { OfferStatus: "ACTIVE" }
          );

          // Loop through products and update their price with the offer price
          offer.Subcategories.forEach(async (subcategory) => {
            // get offer ProductDetails
            const productDetails = await ProductModal.find({
              SubCategoryID: subcategory,
            });

            if (productDetails?.length > 0) {
              // Loop through products and update their price with the offer price
              productDetails.forEach(async (product) => {
                // calculate offer price
                const NewSalePrice =
                  Math.floor(Number(product.RegularPrice) -
                  (Number(product.RegularPrice) *
                    Number(offer.DiscountPercent)) /
                    100);

                //update offer price
                await ProductModal.findOneAndUpdate(
                  { ProductID: product.ProductID },
                  { SalePrice: NewSalePrice }
                );
              });
            }
          });
        }
      } else if (currentDate > OfferEndingDate) {
        // If offer is expired & offertype is PRODUCT but status is ACTIVE
        if (offer.OfferStatus === "ACTIVE" && offer.OfferType === "PRODUCT") {
          // Update Offer Status to EXPIRED
          await OfferModal.findOneAndUpdate(
            { OfferID: offer.OfferID },
            { OfferStatus: "EXPIRED" }
          );
          // update product price to regular price
          offer.Products.forEach(async (product) => {
            // get offer ProductDetails
            const productDetails = await ProductModal.findOne({
              ProductID: product,
            });

            if (productDetails?.ProductID) {
              // update offer price
              await ProductModal.findOneAndUpdate(
                { ProductID: product },
                { SalePrice: productDetails.RegularPrice }
              );
            }
          });
        } else if (
          offer.OfferStatus === "ACTIVE" &&
          offer.OfferType === "SUBCATEGORY"
        ) {
          // if offer status is ACTIVE & offertype is SUBCATEGORY
          // Update Offer Status to EXPIRED
          await OfferModal.findOneAndUpdate(
            { OfferID: offer.OfferID },
            { OfferStatus: "EXPIRED" }
          );
          // update product price to regular price
          offer.Subcategories.forEach(async (subcategory) => {
            // get offer ProductDetails
            const productDetails = await ProductModal.find({
              SubCategoryID: subcategory,
            });
            if (productDetails?.length > 0) {
              // Loop through products and update their price with the offer price
              productDetails.forEach(async (product) => {
                // update offer price
                await ProductModal.findOneAndUpdate(
                  { ProductID: product.ProductID },
                  { SalePrice: product.RegularPrice }
                );
              });
            }
          });
        }
      }
    });
  }, 1 * 60000); // min * ms
};

module.exports = checker;
