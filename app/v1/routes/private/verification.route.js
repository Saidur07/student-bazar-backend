const express = require('express')
const router = express()
const {SendEmail} = require('../../utility/email-sender')
const {SendSMS} = require('../../utility/sms-sender')
const {upload} = require('../../middlewares/multer')
const constant = require('../../constant')

/**
 * @swagger
 * /api/v1/private/verification/request_phone_otp:
 *  post:
 *    tags: [private-verification]
 *    description: request phone otp
 *    parameters:
 *      - in: formData
 *        name: phoneNumber
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post('/request_phone_otp', upload.none(), async(req,res)=>{
    try{
        const {phoneNumber} = req.body
        const OTP = Math.floor(100000 + Math.random() * 900000)
        const message = constant.PhoneOTPMSG.replace('{OTP}',OTP)
        const msg = await SendSMS(phoneNumber, message)
        res.status(200).json({status:200, message:msg})
    }catch (e) {
        res.status(400).json({
            status:400,
            message:e.message
        })
    }
})

// /**
//  * @swagger
//  * /api/v1/private/verification/request_email_otp:
//  *  patch:
//  *    tags: [private-verification]
//  *    description: request email otp
//  *    parameters:
//  *      - in: formData
//  *        name: phoneNumber
//  *    responses:
//  *     '200':
//  *      description: A successful response
//  *     '400':
//  *      description: A failed response
//  * 
//  */
router.post('/request_email_otp',async(req,res)=>{
    try{
        const {email,email_verified} = req.decodedToken
        if(email_verified){
            throw new Error('Email already verified')
        }
        //raindom 6 digit otp
        const otp = Math.floor(100000 + Math.random() * 900000)
        const status = await SendEmail(email,'Verify Email',`Your OTP is ${otp}`)
        res.status(200).json({status:200, message:status})
    }catch (e) {
        res.status(400).json({
            status:400,
            message:e.message
        })
    }
})

module.exports = router
