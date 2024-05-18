const express = require("express");
const router = express();
const RequiresAdmin = require("./middlewares/requires-admin");
const RequiresLoggedIn = require("./middlewares/requires-loggedin");
const OfferChecker = require("./utility/offer-checker");
const path = require("path");
const erouter = require('express-dynamic-routing');

erouter({
    prefix: "/admin/",
    app: router,
    folder: path.join(__dirname + "/routes/admin"),
    disableWarnings: true,
    middlewares: [RequiresAdmin]
})

erouter({
    prefix: "/private/",
    app: router,
    folder: path.join(__dirname + "/routes/private"),
    disableWarnings: true,
    middlewares: [RequiresLoggedIn]
})

erouter({
    prefix: "/public/",
    app: router,
    folder: path.join(__dirname + "/routes/public"),
    disableWarnings: true
})

OfferChecker();

module.exports = router;


// get all files names in the public folder
// const admin_files = fs.readdirSync(path.join(__dirname + "/routes/admin"));
// const private_files = fs.readdirSync(path.join(__dirname + "/routes/private"));
// const public_files = fs.readdirSync(path.join(__dirname + "/routes/public"));

// /admin/


// // add all routes to the router
// admin_files.forEach(file => {
//     if(file.endsWith(".js") && file.split('.').includes('route')){
//         const route = require("./routes/admin/" + file);
//         const route_prefix = `/admin/${file?.split('.')[0]}`
//         router.use(route_prefix, RequiresAdmin, route);
//     }
// })

// private_files.forEach(file => {
//     if(file.endsWith(".js") && file.split('.').includes('route')){
//         const route = require("./routes/private/" + file);
//         const route_prefix = `/private/${file?.split('.')[0]}`
//         router.use(route_prefix, RequiresLoggedIn, route);
//     }
// })

// public_files.forEach(file => {
//     if(file.endsWith(".js")&& file.split('.').includes('route')){
//         const route = require("./routes/public/" + file);
//         const route_prefix = `/public/${file?.split('.')[0]}`
//         router.use(route_prefix, route);
//     }
// })

// check if offer is valid for the given date every minute

// // admin routes
// const admin_product = require("./routes/admin/product.route");
// const admin_auth = require("./routes/admin/auth.route");
// const admin_category = require("./routes/admin/category.route");
// const admin_author = require("./routes/admin/author.route");
// const subcategory = require("./routes/admin/subcategory.route");
// const admin_coupon = require("./routes/admin/coupon.route");
// const admin_subject = require("./routes/admin/subject.route");
// const admin_banner = require("./routes/admin/banner.route");
// const admin_order = require("./routes/admin/order.route");
// const admin_publication = require("./routes/admin/publication.route");
// const admin_common_info = require("./routes/admin/common-info.route");
// const admin_contests = require("./routes/admin/contests.route");
// const admin_brand = require("./routes/admin/brand.route");
// const admin_higher_edu = require("./routes/admin/higher-edu-route");
// const admin_offer = require("./routes/admin/offer.route");
// const admin_admin_log = require("./routes/admin/admin-log.route");
// const admin_attribute = require("./routes/admin/attribute.route");
// const admin_navbar = require("./routes/admin/navbar.route");

// router.use("/admin/product", RequiresAdmin, admin_product);
// router.use("/admin/auth", admin_auth);
// router.use("/admin/category", RequiresAdmin, admin_category);
// router.use("/admin/author", RequiresAdmin, admin_author);
// router.use("/admin/subcategory", RequiresAdmin, subcategory);
// router.use("/admin/coupon", RequiresAdmin, admin_coupon);
// router.use("/admin/subject", RequiresAdmin, admin_subject);
// router.use("/admin/banner", RequiresAdmin, admin_banner);
// router.use("/admin/order", RequiresAdmin, admin_order);
// router.use("/admin/publication", RequiresAdmin, admin_publication);
// router.use("/admin/commoninfo", RequiresAdmin, admin_common_info);
// router.use("/admin/contests", RequiresAdmin, admin_contests);
// router.use("/admin/brand", RequiresAdmin, admin_brand);
// router.use("/admin/higher-edu", RequiresAdmin, admin_higher_edu);
// router.use("/admin/offer", RequiresAdmin, admin_offer);
// router.use("/admin/admin-log", RequiresAdmin, admin_admin_log);
// router.use("/admin/attribute", RequiresAdmin, admin_attribute);
// router.use("/admin/navbar", RequiresAdmin, admin_navbar);

// // private routes
// const private_auth = require("./routes/private/auth.route");
// const private_cart = require("./routes/private/cart.route");
// const private_address = require("./routes/private/address.route");
// const private_order = require("./routes/private/order.route");
// const private_verification = require("./routes/private/verification.route");
// const private_customer = require("./routes/private/customer.route");
// const private_favorite = require("./routes/private/favorite.route");
// const private_review = require("./routes/private/review.route");

// router.use("/private/auth", RequiresLoggedIn, private_auth);
// router.use("/private/cart", RequiresLoggedIn, private_cart);
// router.use("/private/address", RequiresLoggedIn, private_address);
// router.use("/private/order", RequiresLoggedIn, private_order);
// router.use("/private/verification", RequiresLoggedIn, private_verification);
// router.use("/private/customer", RequiresLoggedIn, private_customer);
// router.use("/private/favorite", RequiresLoggedIn, private_favorite);
// router.use("/private/review", RequiresLoggedIn, private_review);

// // public routes
// const public_product = require("./routes/public/product.route");
// const public_subject = require("./routes/public/subject.route");
// const public_author = require("./routes/public/author.route");
// const public_address_info = require("./routes/public/address-info.route");
// const public_banner = require("./routes/public/banner.route");
// const public_publication = require("./routes/public/publication.route");
// const public_auth = require("./routes/public/auth.route");
// const public_contests = require("./routes/public/contests.route");
// const public_common_info = require("./routes/public/common-info.route");
// const public_review = require("./routes/public/review.route");
// const public_filter_info = require("./routes/public/filter-info.route");
// const public_category = require("./routes/public/category.route");
// const public_higher_edu = require("./routes/public/higher-edu.route");
// const public_offer = require("./routes/public/offer.route");
// const public_subcategory = require("./routes/public/subcategory.route");
// const public_brand = require("./routes/public/brand.route");
// const public_coustomer = require("./routes/public/customer.route");
// const public_navbar = require("./routes/public/navbar.route");

// router.use("/public/product", public_product);
// router.use("/public/subject", public_subject);
// router.use("/public/author", public_author);
// router.use("/public/address-info", public_address_info);
// router.use("/public/banner", public_banner);
// router.use("/public/publication", public_publication);
// router.use("/public/auth", public_auth);
// router.use("/public/contests", public_contests);
// router.use("/public/commoninfo", public_common_info);
// router.use("/public/review", public_review);
// router.use("/public/filter-info", public_filter_info);
// router.use("/public/category", public_category);
// router.use("/public/higher-edu", public_higher_edu);
// router.use("/public/offer", public_offer);
// router.use("/public/subcategory", public_subcategory);
// router.use("/public/brand", public_brand);
// router.use("/public/customer", public_coustomer);
// router.use("/public/navbar", public_navbar);