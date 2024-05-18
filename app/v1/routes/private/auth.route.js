const express = require('express')
const router = express()
const CustomerModel = require('../../models/customer.model')
const OTPModel = require('../../models/otp.model')
const {upload} = require('../../middlewares/multer')
const bcrypt = require("bcryptjs");
const uuidv4 = require('uuid').v4
const jwt = require('jsonwebtoken')
const {SendSMS} = require('../../utility/sms-sender')
const {SendEmail} = require('../../utility/email-sender')
const constant = require('../../constant')

const SendOTPEmail = async({provider,ProviderCredential,user_data}) => {
    try {
        const OTP = Math.floor(Math.random() * 899999 + 100000)
        const OTPHash = await bcrypt.hash(OTP.toString(), bcrypt.genSaltSync())
        const Expiry = Date.now() + 5 * 60 * 1000

        const OTPObject = {
            OTPHash,
            Expiry,
            Provider:provider,
            ProviderCredential:ProviderCredential
        }
        console.log(OTPObject)
        console.log(user_data?.CustomerID)

        await OTPModel.findOneAndUpdate(
            {CustomerID: user_data.CustomerID},
            {...OTPObject},
            {new: true, upsert: true}
        )
    
        const message = `Your OTP is ${OTP}`
        const subject = 'OTP for verification'

        await SendEmail({ProviderCredential,text:message,subject:subject,email:ProviderCredential})
        return true
    } catch (e) {
        console.log(e)
    }
}

const SendOTPSMS = async({provider,ProviderCredential,user_data}) => {
    try {
        const OTP = Math.floor(Math.random() * 899999 + 100000)
        const OTPHash = await bcrypt.hash(OTP.toString(), bcrypt.genSaltSync())
        const Expiry = Date.now() + 5 * 60 * 1000

        const OTPObject = {
            OTPHash,
            Expiry,
            Provider:provider,
            ProviderCredential:ProviderCredential
        }

        await OTPModel.findOneAndUpdate(
            {CustomerID: user_data.CustomerID},
            {...OTPObject},
            {new: true, upsert: true}
        )

        const message = constant.PhoneOTPMSG.replace('{OTP}',OTP)
        await SendSMS(ProviderCredential,message)

        return true
    }catch (e) {
        console.log(e)
    }
}


/**
 * @swagger
 * /api/v1/private/auth/request-email-verification:
 *  post:
 *    tags: [private-auth]
 *    description: request email verification
 *    parameters:
 *      - in: formData
 *        name: Email
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post('/request-email-verification',upload.none(), async (req, res) => {
    try{
        console.log(req.decodedToken)
        const {CustomerID} = req.decodedToken
        
        const customer = req?.customerData ? req.customerData : await CustomerModel.findOne({CustomerID})

        if(!customer?.CustomerID){
            throw new Error('Customer not found')
        }

        if(customer?.AuthProvider === "EMAIL"){
            if(customer?.EmailVerified){
                throw new Error("Email already verified")
            }else{
                // verify email
                const email = customer?.Email
                await SendOTPEmail({
                    user_data: customer, 
                    provider: "EMAIL",
                    ProviderCredential:email
                })
                res.status(200).json({
                    message: "OTP sent",
                    status: 200
                })
            }

        }else{
            if(customer?.EmailVerified && customer?.Email){
                throw new Error("Email already verified")
            }else{
                // verify email
                const email = req.body?.Email
                if(!email){
                    throw new Error("Email is required")
                }
                const email_exists = req?.customerData ? req?.customerData : await CustomerModel.findOne({Email:email})
                if(email_exists?.Email){
                    throw new Error("This email is already used by someone else")
                }

                await SendOTPEmail({
                    user_data: customer, 
                    provider: "EMAIL",
                    ProviderCredential:email
                })
                res.status(200).json({
                    message: "OTP sent",
                    status: 200
                })
            }
        }

    }catch(e){
        res.status(400).json({ status: 400, message: e.message })
    }
})

/**
 * @swagger
 * /api/v1/private/auth/verify-email:
 *  post:
 *    tags: [private-auth]
 *    description: verify email
 *    parameters:
 *      - in: formData
 *        name: OTP
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post('/verify-email',upload.none(), async (req, res) => {
    try{
        const {OTP} = req.body
        const {CustomerID} = req.decodedToken
        const customer = req?.customerData ? req.customerData : await CustomerModel.findOne({CustomerID})

        const OTPObject = await OTPModel.findOne({CustomerID})
        if(!OTPObject?.CustomerID){
            throw new Error("OTP was not requested")
        }
        console.log(Date.now())
        console.log(OTPObject?.Expiry > Date.now())
        if(OTPObject?.Expiry < Date.now()){
            throw new Error("OTP has expired")
        }

        const OTPHash = OTPObject?.OTPHash
        const isValid = await bcrypt.compare(OTP.toString(), OTPHash)
        if(!isValid){
            throw new Error("OTP is invalid")
        }

        await OTPModel.findOneAndDelete({CustomerID})
        await CustomerModel.findOneAndUpdate({CustomerID},{EmailVerified:true, Email:OTPObject?.ProviderCredential}) 
        res.status(200).json({
            message: "Email verified",
            status: 200
        })
    }catch(e){
        res.status(400).json({ status: 400, message: e.message })
    }
})

/**
 * @swagger
 * /api/v1/private/auth/request-phone-verification:
 *  post:
 *    tags: [private-auth]
 *    description: request email verification
 *    parameters:
 *      - in: formData
 *        name: PhoneNumber
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post('/request-phone-verification',upload.none(), async (req, res) => {
    try{
        const {CustomerID} = req.decodedToken
        const customer = req?.customerData ? req.customerData : await CustomerModel.findOne({CustomerID})

        if(!customer?.CustomerID){
            throw new Error('Customer not found')
        }

        if(customer?.AuthProvider === "PHONE"){
            if(customer?.PhoneVerified){
                throw new Error("Phone already verified")
            }else{
                // verify phone
                const phone = customer?.PhoneNumber
                await SendOTPSMS({
                    user_data: customer, 
                    provider: "PHONE",
                    ProviderCredential:phone
                })
                res.status(200).json({
                    message: "OTP sent",
                    status: 200
                })
            }

        }else if(customer?.AuthProvider === "EMAIL"){
            if(customer?.PhoneVerified && customer?.PhoneNumber){
                throw new Error("Phone already verified")
            }else{
                // verify phone
                const phone = req.body?.PhoneNumber
                if(!phone){
                    throw new Error("Phone is required")
                }
                const phone_exists = await CustomerModel.findOne({PhoneNumber:phone})
                if(phone_exists?.PhoneNumber && phone_exists?.CustomerID !== customer?.CustomerID){ 
                    throw new Error("This phone is already used by someone else")
                }

                await SendOTPSMS({
                    user_data: customer, 
                    provider: "PHONE",
                    ProviderCredential:phone
                })
                res.status(200).json({
                    message: "OTP sent",
                    status: 200
                })
            }}
    }catch(e){
        res.status(400).json({ status: 400, message: e.message })
    }
})

/**
 * @swagger
 * /api/v1/private/auth/verify-phone:
 *  post:
 *    tags: [private-auth]
 *    description: verify phone otp
 *    parameters:
 *      - in: formData
 *        name: OTP
 *    responses:
 *     '200':
 *      description: A successful response
 *     '400':
 *      description: A failed response
 * 
 */
router.post('/verify-phone',upload.none(), async (req, res) => {
    try{
        const {OTP} = req.body
        const {CustomerID} = req.decodedToken
        const customer = req?.customerData ? req.customerData : await CustomerModel.findOne({CustomerID})

        const OTPObject = await OTPModel.findOne({CustomerID})
        if(!OTPObject?.CustomerID){
            throw new Error("OTP was not requested")
        }
        console.log(Date.now())
        console.log(OTPObject?.Expiry > Date.now())
        if(OTPObject?.Expiry < Date.now()){
            throw new Error("OTP has expired")
        }

        const OTPHash = OTPObject?.OTPHash
        const isValid = await bcrypt.compare(OTP.toString(), OTPHash)
        if(!isValid){
            throw new Error("OTP is invalid")
        }

        await OTPModel.findOneAndDelete({CustomerID})
        await CustomerModel.findOneAndUpdate({CustomerID},{PhoneVerified:true, PhoneNumber:OTPObject?.ProviderCredential}) 
        res.status(200).json({
            message: "Phone verified",
            status: 200
        })
    }catch(e){
        res.status(400).json({ status: 400, message: e.message })
    }
})

module.exports = router