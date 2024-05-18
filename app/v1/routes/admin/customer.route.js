const express = require("express");
const router = express();
const CustomerModel = require("../../models/customer.model");

/**
 * @swagger
 * /api/v1/admin/customer/:
 *  get:
 *    tags: [admin-customer]
 *    description: Customer list
 *    parameters:
 *     - in: query
 *       name: query
 *     - in: query
 *       name: page
 *     - in: query
 *       name: limit
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */

router.get("/", async (req, res) => {
    try {
        const { query, page = 1, limit = 20 } = req.query;
        const data = query ?
            await CustomerModel.find({ $text: { $search: query }, ...req.query }).skip((page - 1) * limit).limit(limit) :
            await CustomerModel.find(req.query).limit(limit * 1).skip((page - 1) * limit);

        // remove PasswordHash from response
        data.map((item) => {
            item.PasswordHash = undefined;
        });

        res.status(200).json({ status: 200, customers: data });
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message });
    }
})


/**
 * @swagger
 * /api/v1/admin/customer/{CustomerID}:
 *  get:
 *    tags: [admin-customer]
 *    description: Customer list
 *    parameters:
 *     - in: path
 *       name: CustomerID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.get("/:id", async (req, res) => {
    try {
        const data = await CustomerModel.findOne({ CustomerID: req.params.id });
        res.status(200).json({ status: 200, customer: data });
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message });
    }
});

/**
 * @swagger
 * /api/v1/admin/customer/disable/{CustomerID}:
 *  patch:
 *    tags: [admin-customer]
 *    description: Customer list
 *    parameters:
 *     - in: path
 *       name: CustomerID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.patch("/disable/:id", async (req, res) => {
    try {
        await CustomerModel.findOneAndUpdate({ CustomerID: req.params.id }, { Disabled: true });
        res.status(200).json({ status: 200, message: "Customer disabled successfully" });
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message });
    }
});

/**
 * @swagger
 * /api/v1/admin/customer/activate/{CustomerID}:
 *  patch:
 *    tags: [admin-customer]
 *    description: Customer list
 *    parameters:
 *     - in: path
 *       name: CustomerID
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.patch("/activate/:id", async (req, res) => {
    try {
        await CustomerModel.findOneAndUpdate({ CustomerID: req.params.id }, { Disabled: false });
        res.status(200).json({ status: 200, message: "Customer activated successfully" });
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message });
    }
});


// const data = [
//     {
//         "_id": "63351eef2611037185618d39",
//         "CategoryID": "13",
//         "ParentCategoryID": "0",
//         "CategoryName": "Science",
//         "CategorySlug": "science-13",
//         "ProductType": "STATIONARY",
//         "CategoryBanner": "",
//         "Popular": true,
//         "__v": 0
//     },
//     {
//         "_id": "6335aa002611037185619997",
//         "CategoryID": "14",
//         "ParentCategoryID": "0",
//         "CategoryName": "Madrasa",
//         "CategorySlug": "madrasa-14",
//         "ProductType": "ACADEMIC_BOOK",
//         "CategoryBanner": "",
//         "Popular": false,
//         "__v": 0
//     },
//     {
//         "_id": "6335ab0a2611037185619a20",
//         "CategoryID": "15",
//         "ParentCategoryID": "14",
//         "CategoryName": "class one ",
//         "CategorySlug": "class-one--15",
//         "ProductType": "ACADEMIC_BOOK",
//         "CategoryBanner": "",
//         "Popular": true,
//         "__v": 0
//     },
//     {
//         "_id": "6335ab1a2611037185619a25",
//         "CategoryID": "16",
//         "ParentCategoryID": "14",
//         "CategoryName": "class two",
//         "CategorySlug": "class-two-16",
//         "ProductType": "ACADEMIC_BOOK",
//         "CategoryBanner": "",
//         "Popular": false,
//         "__v": 0
//     },
//     {
//         "_id": "6335ab232611037185619a2a",
//         "CategoryID": "17",
//         "ParentCategoryID": "14",
//         "CategoryName": "class three",
//         "CategorySlug": "class-three-17",
//         "ProductType": "ACADEMIC_BOOK",
//         "CategoryBanner": "",
//         "Popular": false,
//         "__v": 0
//     },
//     {
//         "_id": "6335b1382611037185619bca",
//         "CategoryID": "20",
//         "ParentCategoryID": "19",
//         "CategoryName": "one",
//         "CategorySlug": "one-20",
//         "ProductType": "ACADEMIC_BOOK",
//         "CategoryBanner": "",
//         "Popular": false,
//         "__v": 0
//     },
//     {
//         "_id": "63364c7ea871b0b72579aea4",
//         "CategoryID": "21",
//         "ParentCategoryID": "13",
//         "CategoryName": "kolom",
//         "CategorySlug": "kolom-21",
//         "ProductType": "STATIONARY",
//         "CategoryBanner": "",
//         "Popular": true,
//         "__v": 0
//     },
//     {
//         "_id": "6336b1cea871b0b72579bb04",
//         "CategoryID": "22",
//         "ParentCategoryID": "11",
//         "CategoryName": "Motivational",
//         "CategorySlug": "motivational-22",
//         "ProductType": "ACADEMIC_BOOK",
//         "CategoryBanner": "",
//         "Popular": false,
//         "__v": 0
//     },
//     {
//         "_id": "6336e75aa871b0b72579cb43",
//         "CategoryID": "24",
//         "ParentCategoryID": "23",
//         "CategoryName": "class one ",
//         "CategorySlug": "class-one--24",
//         "ProductType": "ACADEMIC_BOOK",
//         "CategoryBanner": "",
//         "Popular": false,
//         "__v": 0
//     },
//     {
//         "_id": "6336edfea871b0b72579d16b",
//         "CategoryID": "26",
//         "ParentCategoryID": "15",
//         "CategoryName": "class one child",
//         "CategorySlug": "class-one-child-26",
//         "ProductType": "ACADEMIC_BOOK",
//         "CategoryBanner": "",
//         "Popular": false,
//         "__v": 0
//     },
//     {
//         "_id": "63370c1fa871b0b72579d8ea",
//         "CategoryID": "27",
//         "ParentCategoryID": "0",
//         "CategoryName": "Subject Categories 1",
//         "CategorySlug": "subject-categories-1-27",
//         "ProductType": "SUBJECT_BOOK",
//         "CategoryBanner": "",
//         "Popular": false,
//         "__v": 0
//     },
//     {
//         "_id": "633713f7501ef27c386dfeb8",
//         "CategoryID": "28",
//         "ParentCategoryID": "0",
//         "CategoryName": "Photography",
//         "CategorySlug": "photography-28",
//         "ProductType": "SUBJECT_BOOK",
//         "CategoryBanner": "",
//         "Popular": false,
//         "__v": 0
//     },
//     {
//         "_id": "63385d4918801f558e005ec2",
//         "CategoryID": "30",
//         "ParentCategoryID": "14",
//         "CategoryName": "Class 9-10",
//         "CategorySlug": "class-9-10-30",
//         "ProductType": "ACADEMIC_BOOK",
//         "CategoryBanner": "",
//         "Popular": true,
//         "__v": 0
//     },
//     {
//         "_id": "63391ec7db6fa9c9ba2e481a",
//         "CategoryID": "32",
//         "ParentCategoryID": "0",
//         "CategoryName": "computer",
//         "CategorySlug": "computer-32",
//         "ProductType": "FASHION",
//         "CategoryBanner": "",
//         "Popular": false,
//         "__v": 0
//     },
//     {
//         "_id": "63392e40db6fa9c9ba2e533c",
//         "CategoryID": "33",
//         "ParentCategoryID": "0",
//         "CategoryName": "bangla vasa o sahitto ",
//         "CategorySlug": "bangla-vasa-o-sahitto--33",
//         "ProductType": "SUBJECT_BOOK",
//         "CategoryBanner": "",
//         "Popular": false,
//         "__v": 0
//     },
//     {
//         "_id": "63392e59db6fa9c9ba2e5344",
//         "CategoryID": "35",
//         "ParentCategoryID": "0",
//         "CategoryName": "manush o poribesh ",
//         "CategorySlug": "manush-o-poribesh--35",
//         "ProductType": "SUBJECT_BOOK",
//         "CategoryBanner": "",
//         "Popular": true,
//         "__v": 0
//     },
//     {
//         "_id": "63392e68db6fa9c9ba2e5348",
//         "CategoryID": "36",
//         "ParentCategoryID": "0",
//         "CategoryName": "banglar krishi",
//         "CategorySlug": "banglar-krishi-36",
//         "ProductType": "SUBJECT_BOOK",
//         "CategoryBanner": "",
//         "Popular": false,
//         "__v": 0
//     },
//     {
//         "_id": "63392e7bdb6fa9c9ba2e534d",
//         "CategoryID": "37",
//         "ParentCategoryID": "0",
//         "CategoryName": "bangla desh o jati ",
//         "CategorySlug": "bangla-desh-o-jati--37",
//         "ProductType": "SUBJECT_BOOK",
//         "CategoryBanner": "",
//         "Popular": false,
//         "__v": 0
//     },
//     {
//         "_id": "633aaaa1e8dd07ddb541bc32",
//         "CategoryID": "39",
//         "ParentCategoryID": "0",
//         "CategoryName": "Electronics",
//         "CategorySlug": "electronics-39",
//         "ProductType": "STATIONARY",
//         "CategoryBanner": "",
//         "Popular": false,
//         "__v": 0
//     },
//     {
//         "_id": "633db89f3553318b282d5ccc",
//         "CategoryID": "44",
//         "ParentCategoryID": "0",
//         "CategoryName": "tst65547647",
//         "CategorySlug": "tst65547647-44",
//         "ProductType": "ACADEMIC_BOOK",
//         "CategoryBanner": "",
//         "Popular": false,
//         "__v": 0
//     },
//     {
//         "_id": "6348f6bbc12c67795a1be2d6",
//         "CategoryID": "46",
//         "ParentCategoryID": "30",
//         "CategoryName": "Sciencer",
//         "CategorySlug": "sciencer-46",
//         "ProductType": "ACADEMIC_BOOK",
//         "CategoryBanner": "",
//         "Popular": false,
//         "__v": 0
//     },
//     {
//         "_id": "6348f6c7c12c67795a1be2db",
//         "CategoryID": "47",
//         "ParentCategoryID": "30",
//         "CategoryName": "Arts",
//         "CategorySlug": "arts-47",
//         "ProductType": "ACADEMIC_BOOK",
//         "CategoryBanner": "",
//         "Popular": false,
//         "__v": 0
//     },
//     {
//         "_id": "634a7a5f6b709e5c4edeaafd",
//         "CategoryID": "48",
//         "ParentCategoryID": "26",
//         "CategoryName": "Robotics",
//         "CategorySlug": "robotics-48",
//         "ProductType": "ACADEMIC_BOOK",
//         "CategoryBanner": "https://storage.googleapis.com/download/storage/v1/b/genres-project-1.appspot.com/o/CategoryBanner-1665825374307-527386915-STATIONARY-(2).png?generation=1665825374933602&alt=media",
//         "Popular": false,
//         "__v": 0
//     },
//     {
//         "_id": "634ba5342c834a5bb84114b7",
//         "CategoryID": "49",
//         "ParentCategoryID": "0",
//         "CategoryName": "Programming",
//         "CategorySlug": "programming-49",
//         "ProductType": "ACADEMIC_BOOK",
//         "CategoryBanner": "https://storage.googleapis.com/download/storage/v1/b/genres-project-1.appspot.com/o/CategoryBanner-1665901875296-661862645-STATIONARY.png?generation=1665901875735896&alt=media",
//         "Popular": false,
//         "__v": 0
//     },
//     {
//         "_id": "634c64145f262d8a9a6a2c86",
//         "CategoryID": "50",
//         "ParentCategoryID": "26",
//         "CategoryName": "teryey",
//         "CategorySlug": "teryey-50",
//         "ProductType": "ACADEMIC_BOOK",
//         "CategoryBanner": "",
//         "Popular": false,
//         "__v": 0
//     },
//     {
//         "_id": "634ece2e50ad77e698019865",
//         "CategoryID": "51",
//         "ParentCategoryID": "17",
//         "CategoryName": "Test ",
//         "CategorySlug": "test--51",
//         "ProductType": "ACADEMIC_BOOK",
//         "CategoryBanner": "",
//         "Popular": false,
//         "__v": 0
//     },
//     {
//         "_id": "634f8ac10ec89a8cf34d189d",
//         "CategoryID": "52",
//         "ParentCategoryID": "14",
//         "CategoryName": "kolom",
//         "CategorySlug": "kolom-52",
//         "ProductType": "ACADEMIC_BOOK",
//         "CategoryBanner": "https://storage.googleapis.com/download/storage/v1/b/genres-project-1.appspot.com/o/CategoryBanner-1666157247944-406151067-51mPKoLnpML._SY418_BO1,204,203,200_.jpg?generation=1666157248744400&alt=media",
//         "Popular": false,
//         "__v": 0
//     }
// ]
// const arr = []
// const fun = (CategoryID, num) => {
//     const childs = data.filter((item) => item.ParentCategoryID == CategoryID);
//     if (childs) {
//         childs.forEach(element => {
//             arr.push({
//                 ...element,
//                 CategoryName: `${'-'.repeat(num)}${element.CategoryName}`
//             })
//             fun(element.CategoryID, num + 1)
//         });
//     }
// }
// fun('0', 0)
// console.log(arr)

module.exports = router;
