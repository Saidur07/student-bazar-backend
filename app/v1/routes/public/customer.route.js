const express = require("express");
const app = express();
const CustomerModel = require("../../models/customer.model");


/**
 * @swagger
 * /api/v1/public/customer/:
 *  get:
 *    tags: [public-customer]
 *    description: Get Customer data
 *    parameters:
 *      - in: query
 *        name: CustomerID
 *      - in: query
 *        name: CustomerName
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */

app.get("/", async (req, res) => {
try {
    const data = await CustomerModel.findOne(req.query)
    if(!data) {
        throw new Error("User not found")
    }
    const CustomerData = {
        CustomerID: data.CustomerID,
        FullName: data.FullName,
        ProfilePic: data.ProfilePic,
    }
    res.status(200).json(CustomerData)
}catch(e){
    res.status(400).json({
        status: 400,
        message: e.message
    })
}
})

module.exports = app;