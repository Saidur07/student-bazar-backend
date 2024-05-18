require('dotenv').config();
const express = require('express')
const router = express()
const fs = require("fs");
const path = require("path");
const { SendSMS } = require('../../utility/sms-sender')
const { SendOTP, SendEmail } = require('../../utility/email-sender')
const jwt = require('jsonwebtoken')
const CustomerModel = require('../../models/customer.model')
const OTPModel = require('../../models/otp.model')
const ResetPasswordModel = require('../../models/reset-password.model')
const AdminAuthModal = require('../../models/admin-auth.model')
const AdminAuthJwtModal = require('../../models/admin-auth-jwt.model')
const AdminLogModel = require('../../models/admin-log.model')
const { upload } = require('../../middlewares/multer')
const bcrypt = require("bcryptjs");
const uuidv4 = require('uuid').v4
const PRIVATE_KEY = Buffer.from(process.env.PRIVATE_RSA_KEY, 'base64').toString('ascii')
const PUB_KEY = Buffer.from(process.env.PUBLIC_RSA_KEY, 'base64').toString('ascii')

/**
 * @swagger
 * /api/v1/public/auth/createUserWithEmailAndPassword:
 *  post:
 *   tags: [public-auth]
 *   description: Create user with email and password
 *   parameters:
 *    - in: formData
 *      name: FullName
 *      schema:
 *       type: string
 *       required: true
 *       description: Enter Full Name
 *    - in: formData
 *      name: Email
 *      schema:
 *       type: string
 *       required: true
 *       description: Enter password
 *    - in: formData
 *      name: Password
 *      schema:
 *       type: string
 *       required: true
 *       description: Enter password
 *   responses:
 *    '200':
 *     description: A successful response
 *    '400':
 *     description: Bad request
 */

router.post('/createUserWithEmailAndPassword', upload.none(), async (req, res) => {
    try {
        const { FullName, Email, Password } = req.body
        // check if the email is vaild
        if (!Email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)) {
            throw new Error('Email is not valid')
        }
        // password strength
        if (!Password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/)) {
            throw new Error('Password must be at least 8 characters long and must contain at least one uppercase letter, one lowercase letter and one number')
        }
        const customer = await CustomerModel.findOne({ Email })
        if (customer?.CustomerID) {
            throw new Error('Email already used by someone else')
        }
        const AuthProvider = 'EMAIL'
        const salt = bcrypt.genSaltSync()
        const passwordHash = await bcrypt.hash(Password, salt)

        const CustomerID = uuidv4()

        const NewCustomer = await CustomerModel.create({ FullName, Email, PasswordHash: passwordHash, AuthProvider, CustomerID })

        const data = {
            CustomerID: NewCustomer?.CustomerID,
            FullName: NewCustomer?.FullName,
            Email: NewCustomer?.Email,
            EmailVerified: NewCustomer?.EmailVerified,
            Phone: NewCustomer?.PhoneNumber,
            PhoneVerified: NewCustomer?.PhoneVerified,
            AuthProvider: NewCustomer?.AuthProvider
        }

        // 6 digit OTP
        const OTP = Math.floor(Math.random() * 899999 + 100000)
        const OTPHash = await bcrypt.hash(OTP.toString(), bcrypt.genSaltSync())
        await OTPModel.findOneAndUpdate({ CustomerID: NewCustomer.CustomerID }, {
            CustomerID,
            OTPHash,
            Provider: AuthProvider,
            ProviderCredential: Email,
            Expiry: Date.now() + 5 * 60 * 1000
        }, { upsert: true, new: true })


        await SendOTP({ email: Email, OTP })
        // const token = jwt.sign(data, PRIVATE_KEY, { expiresIn: 12*60*60, algorithm: 'RS256' });
        res.status(200).json({ status: 200, message: "Verification email sent!", user_data: data })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})


/**
 * @swagger
 * /api/v1/public/auth/createUserWithPhoneNumber:
 *  post:
 *   tags: [public-auth]
 *   description: Create user with phone number
 *   parameters:
 *    - in: formData
 *      name: FullName
 *      schema:
 *       type: string
 *       required: true
 *       description: Enter Full Name
 *    - in: formData
 *      name: PhoneNumber
 *      schema:
 *       type: string
 *       required: true
 *       description: Enter password
 *   responses:
 *    '200':
 *     description: A successful response
 *    '400':
 *     description: Bad request
 */


router.post('/createUserWithPhoneNumber', upload.none(), async (req, res) => {
    try {
        const { FullName, PhoneNumber } = req.body
        const AuthProvider = 'PHONE'
        // Check if the number is a vaild bangladeshi number
        if (!PhoneNumber.match(/^(\+8801)[1|3-9]{1}(\d){8}$/)) {
            throw new Error('Phone number is not valid')
        }

        const customer = await CustomerModel.findOne({ PhoneNumber })
        if (customer?.PhoneNumber) {
            throw new Error('This phone number is already used by someone else')
        }

        const CustomerID = uuidv4()
        const new_customer = await CustomerModel.create({
            FullName, PhoneNumber, AuthProvider, CustomerID
        })

        const otp = Math.floor(Math.random() * 899999 + 100000)
        const message = `Your OTP is ${otp}`
        await SendSMS(PhoneNumber, message)

        const OTPHash = await bcrypt.hash(otp.toString(), bcrypt.genSaltSync())
        await OTPModel.findOneAndUpdate({ CustomerID: new_customer.CustomerID }, {
            CustomerID,
            OTPHash,
            Provider: "PHONE",
            ProviderCredential: PhoneNumber,
            Expiry: Date.now() + 5 * 60 * 1000
        }, { upsert: true, new: true })

        res.status(200).json({ status: 200, message: "OTP Sent", customer: new_customer })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})

/**
 * @swagger
 * /api/v1/public/auth/signInWithEmailPassword:
 *  post:
 *   tags: [public-auth]
 *   description: Use to request create user with email and password
 *   parameters:
 *    - in: formData
 *      name: Email
 *      schema:
 *       type: string
 *       required: true
 *       description: Enter email
 *    - in: formData
 *      name: Password
 *      schema:
 *       type: string
 *       required: true
 *       description: Enter password
 *   responses:
 *    '200':
 *     description: A successful response
 *    '400':
 *     description: Bad request
 */

router.post('/signInWithEmailPassword', upload.none(), async (req, res) => {
    try {
        const { Email, Password } = req.body
        const customer = await CustomerModel.findOne({ Email })
        if (!customer) {
            throw new Error("Invalid email or password")
        }
        const passwordCorrect = await bcrypt.compare(Password, customer.PasswordHash)
        if (!passwordCorrect) {
            throw new Error("Invalid email or password")
        }
        const data = {
            CustomerID: customer?.CustomerID,
            FullName: customer?.FullName,
            Email: customer?.Email,
            EmailVerified: customer?.EmailVerified,
            Phone: customer?.PhoneNumber,
            PhoneVerified: customer?.PhoneVerified,
            AuthProvider: customer?.AuthProvider
        }
        const token = jwt.sign(data, PRIVATE_KEY, { expiresIn: 12 * 60 * 60, algorithm: 'RS256' });
        res.status(200).cookie('accessToken', token).json({ status: 200, message: "Logged In Successfully", user_data: { ...data, accessToken: token } })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})


/**
 * @swagger
 * /api/v1/public/auth/checkPhoneOTP:
 *  post:
 *   tags: [public-auth]
 *   description: verify phone OTP
 *   parameters:
 *    - in: formData
 *      name: CustomerID
 *      schema:
 *       type: string
 *       required: true
 *       description: Enter CustomerID
 *    - in: formData
 *      name: OTP
 *      schema:
 *       type: string
 *       required: true
 *       description: Enter OTP
 *   responses:
 *    '200':
 *     description: A successful response
 *    '400':
 *     description: Bad request
 */

router.post('/checkPhoneOTP', upload.none(), async (req, res) => {
    try {
        const { CustomerID, OTP } = req.body
        const otp_data = await OTPModel.findOne({ CustomerID, Provider: "PHONE" })
        if (!otp_data || otp_data?.Provider !== "PHONE") {
            throw new Error("OTP was not requested")
        }
        if (otp_data.Expiry < Date.now()) {
            throw new Error('OTP Expired')
        }
        if (!otp_data?.OTPHash) {
            throw new Error("Invalid OTP")
        }
        const otp_correct = await bcrypt.compare(OTP, otp_data.OTPHash)
        if (!otp_correct) {
            throw new Error("Invalid OTP")
        }
        const updated_customer = await CustomerModel.findOneAndUpdate({ CustomerID }, { PhoneVerified: true }, { new: true })
        const data = {
            CustomerID: updated_customer?.CustomerID,
            FullName: updated_customer?.FullName,
            Email: updated_customer?.Email,
            EmailVerified: updated_customer?.EmailVerified,
            Phone: updated_customer?.PhoneNumber,
            PhoneVerified: updated_customer?.PhoneVerified,
            AuthProvider: updated_customer?.AuthProvider
        }
        // remove OTP
        await OTPModel.findOneAndDelete({ CustomerID })
        // token expire 12 hours
        const token = jwt.sign(data, PRIVATE_KEY, { expiresIn: 12 * 60 * 60, algorithm: 'RS256' });
        res.status(200).cookie('accessToken', token).json({ status: 200, message: "OTP Verified", user_data: { ...data, accessToken: token } })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})

/**
 * @swagger
 * /api/v1/public/auth/checkEmailOTP:
 *  post:
 *   tags: [public-auth]
 *   description: verify email OTP
 *   parameters:
 *    - in: formData
 *      name: CustomerID
 *      schema:
 *       type: string
 *       required: true
 *       description: Enter CustomerID
 *    - in: formData
 *      name: OTP
 *      schema:
 *       type: string
 *       required: true
 *       description: Enter OTP
 *   responses:
 *    '200':
 *     description: A successful response
 *    '400':
 *     description: Bad request
 */

router.post('/checkEmailOTP', upload.none(), async (req, res) => {
    try {
        const { CustomerID, OTP } = req.body
        const otp_data = await OTPModel.findOne({ CustomerID, Provider: "EMAIL" })
        if (!otp_data || otp_data?.Provider !== "EMAIL") {
            throw new Error("OTP was not requested")
        }
        if (otp_data.Expiry < Date.now()) {
            throw new Error('OTP Expired')
        }
        if (!otp_data?.OTPHash) {
            throw new Error("Invalid OTP")
        }
        const otp_correct = await bcrypt.compare(OTP, otp_data.OTPHash)
        if (!otp_correct) {
            throw new Error("Invalid OTP")
        }
        const updated_customer = await CustomerModel.findOneAndUpdate({ CustomerID }, { EmailVerified: true }, { new: true })
        const data = {
            CustomerID: updated_customer?.CustomerID,
            FullName: updated_customer?.FullName,
            Email: updated_customer?.Email,
            EmailVerified: updated_customer?.EmailVerified,
            Phone: updated_customer?.PhoneNumber,
            PhoneVerified: updated_customer?.PhoneVerified,
            AuthProvider: updated_customer?.AuthProvider
        }
        // remove OTP
        await OTPModel.findOneAndDelete({ CustomerID })
        // token expire 12 hours
        const token = jwt.sign(data, PRIVATE_KEY, { expiresIn: 12 * 60 * 60, algorithm: 'RS256' });
        res.status(200).cookie('accessToken', token).json({ status: 200, message: "OTP Verified", user_data: { ...data, accessToken: token } })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})

/**
 * @swagger
 * /api/v1/public/auth/signInWithPhoneNumber:
 *  post:
 *   tags: [public-auth]
 *   description: signin with phone number
 *   parameters:
 *    - in: formData
 *      name: PhoneNumber
 *      schema:
 *       type: string
 *       required: true
 *       description: Enter phone number
 *   responses:
 *    '200':
 *     description: A successful response
 *    '400':
 *     description: Bad request
 */

router.post('/signInWithPhoneNumber', upload.none(), async (req, res) => {
    try {
        const { PhoneNumber } = req.body
        const customer = await CustomerModel.findOne({ PhoneNumber })
        if (!customer?.PhoneNumber) {
            throw new Error("Phone number not registered")
        }
        await OTPModel.findOneAndDelete({ CustomerID: customer.CustomerID })
        const otp = Math.floor(Math.random() * 899999 + 100000)
        const message = `Your OTP is ${otp}`
        await SendSMS(PhoneNumber, message)

        const OTPHash = await bcrypt.hash(otp.toString(), bcrypt.genSaltSync())
        await OTPModel.findOneAndUpdate({ CustomerID: customer.CustomerID }, {
            CustomerID: customer.CustomerID,
            OTPHash,
            Provider: "PHONE",
            ProviderCredential: PhoneNumber,
            Expiry: Date.now() + 5 * 60 * 1000
        }, { upsert: true, new: true })

        res.status(200).json({ status: 200, message: "OTP Sent", user_data: { CustomerID: customer.CustomerID } })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})


/**
 * @swagger
 * /api/v1/public/auth/reset-password:
 *  post:
 *   tags: [public-auth]
 *   description: forgot password
 *   parameters:
 *    - in: formData
 *      name: Email
 *      schema:
 *       type: string
 *       required: true
 *       description: Enter Email
 *   responses:
 *    '200':
 *     description: A successful response
 *    '400':
 *     description: Bad request
 */


router.post('/reset-password', upload.none(), async (req, res) => {
    try {
        const { Email } = req.body

        const customer = await CustomerModel.findOne({ Email, AuthProvider: "EMAIL" })

        if (!customer?.CustomerID) {
            throw new Error("User does not exist")
        }

        const OTP = Math.floor(Math.random() * 899999 + 100000)
        const otpHash = await bcrypt.hash(OTP.toString(), bcrypt.genSaltSync())
        const message = `Your password reset for Student Bazar is ${OTP}.\nPlease do not share this OTP with anyone.`
        // random token generate
        await ResetPasswordModel.findOneAndUpdate(
            { CustomerID: customer.CustomerID },
            {
                CustomerID: customer.CustomerID,
                OTPHash: otpHash,
                PasswordresetExpires: Date.now() + 5 * 60 * 1000,
                AuthProvider: "EMAIL",
                ProviderCredential: Email
            },
            { upsert: true, new: true })

        const Subject = "Password Reset OTP"
        await SendEmail({ email: Email, text: message, subject: Subject })

        res.status(200).json({ status: 200, message: "OTP Sent", user_data: { CustomerID: customer.CustomerID } })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})

/**
 * @swagger
 * /api/v1/public/auth/reset-password-otp-verify:
 *  post:
 *   tags: [public-auth]
 *   description: verify otp for reset password
 *   parameters:
 *    - in: formData
 *      name: CustomerID
 *      schema:
 *       type: string
 *       required: true
 *       description: Enter CustomerID
 *    - in: formData
 *      name: OTP
 *      schema:
 *       type: string
 *       required: true
 *       description: Enter OTP
 *   responses:
 *    '200':
 *     description: A successful response
 *    '400':
 *     description: Bad request
 */

router.post('/reset-password-otp-verify', upload.none(), async (req, res) => {
    try {
        const { CustomerID, OTP } = req.body

        const data = await ResetPasswordModel.findOne({ CustomerID })
        if (!data?.CustomerID) {
            throw new Error("Invalid CustomerID")
        } else if (data.PasswordresetExpires < Date.now()) {
            throw new Error("OTP Expired")
        }

        const otp_correct = await bcrypt.compare(OTP, data.OTPHash)
        if (!otp_correct) {
            throw new Error("Invalid OTP")
        }
        const ResetPasswordToken = uuidv4().replace(/-/g, '')
        const updatedData = await ResetPasswordModel.findOneAndUpdate(
            { CustomerID },
            { ResetPasswordToken, PasswordresetExpires: Date.now() + 5 * 60 * 1000 },
            { new: true })

        res.status(200).json({ status: 200, message: "OTP Verified", user_data: { ResetPasswordToken: updatedData.ResetPasswordToken } })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})

/**
 * @swagger
 * /api/v1/public/auth/reset-password-new-password:
 *  post:
 *   tags: [public-auth]
 *   description: set new password
 *   parameters:
 *    - in: formData
 *      name: ResetPasswordToken
 *      schema:
 *       type: string
 *       required: true
 *       description: Enter ResetPasswordToken
 *    - in: formData
 *      name: NewPassword
 *      schema:
 *       type: string
 *       required: true
 *       description: Enter new password
 *   responses:
 *    '200':
 *     description: A successful response
 *    '400':
 *     description: Bad request
 */

router.post('/reset-password-new-password', upload.none(), async (req, res) => {
    try {
        const { ResetPasswordToken, NewPassword } = req.body

        const data = await ResetPasswordModel.findOne({ ResetPasswordToken })
        if (!data?.ResetPasswordToken) {
            throw new Error("Invalid ResetPasswordToken")
        } else if (data.PasswordresetExpires < Date.now()) {
            await ResetPasswordModel.deleteOne({ ResetPasswordToken })
            throw new Error("ResetPasswordToken Expired")
        }

        const NewPasswordHash = await bcrypt.hash(NewPassword, bcrypt.genSaltSync())
        const updatedData = await CustomerModel.findOneAndUpdate({
            CustomerID: data.CustomerID
        }, {
            PasswordHash: NewPasswordHash
        },
            { new: true })

        await ResetPasswordModel.deleteOne({ ResetPasswordToken })

        res.status(200).json({ status: 200, message: "Password Updated Successfully", user_data: { CustomerID: updatedData.CustomerID } })
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message })
    }
})


/**
 * @swagger
 * /api/v1/public/auth/admin-login:
 *  post:
 *   tags: [public-auth]
 *   description: Dashboard Admin Login
 *   parameters:
 *    - in: formData
 *      name: username
 *      schema:
 *       type: string
 *       required: true
 *       description: Enter username
 *    - in: formData
 *      name: password
 *      schema:
 *       type: string
 *       required: true
 *       description: Enter password
 *   responses:
 *    '200':
 *     description: A successful response
 *    '400':
 *     description: Bad request
 */


// admin Login
router.post("/admin-login", upload.none(), async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await AdminAuthModal.findOne({ username });

        if (!user?.username) {
            return res.status(400).json({ status: 400, message: "Forbidden" });

        }

        const passwordCorrect = await bcrypt.compare(
            password,
            user.EncryptedPassword
        );

        if (!passwordCorrect) {
            res.status(400).json({ status: 400, message: "Forbidden" });
            return;
        }

        const token = jwt.sign(
            {
                username: user.username,
            },
            PRIVATE_KEY,
            { expiresIn: "30m", algorithm: "RS256" }
        );
        const refresh_token = jwt.sign(
            {
                username: user.username,
            },
            PRIVATE_KEY,
            { expiresIn: "1d", algorithm: "RS256" }
        );

        await AdminAuthJwtModal.create({ token: token, refresh_token });

        const user_data = {
            AdminID: user.AdminID,
            FullName: user.FullName,
            username: user.username,
            Disabled: user.Disabled,
            Permissions: user.Permissions,
        };

        // admins action log
        const admin_action = "Logged In: " + username;
        const admin_act_desc = "";
        await AdminLogModel.create({
            username: username,
            action: admin_action,
            action_desc: admin_act_desc,
            createdDate: Date.now(),
        });
        // res.cookie('token', token, { httpOnly: true }).send()
        res.status(200).cookie('token', token).json({ status: 200, token: token, refresh_token, user_data });
    } catch (e) {
        res.status(400).json({ status: 400, message: e.message });
    }
});

/**
 * @swagger
 * /api/v1/public/auth/admin-token:
 *  post:
 *   tags: [public-auth]
 *   description: Refresh token
 *   parameters:
 *    - in: formData
 *      name: refresh_token
 *      schema:
 *       type: string
 *       required: true
 *       description: Enter Refresh Token
 *   responses:
 *    '200':
 *     description: A successful response
 *    '400':
 *     description: Bad request
 */

router.post("/admin-token", async (req, res) => {
    const refresh_token = req.body.token;

    const tokenExists = await AdminAuthJwtModal.find({ refresh_token });
    if (tokenExists.length > 0) {
        jwt.verify(
            refresh_token,
            PUB_KEY,
            { algorithm: "RS256" },
            (err, user) => {
                if (err) {
                    return res
                        .status(403)
                        .json({ status: 403, message: "Forbidden", error: err.message });
                } else {
                    const token = jwt.sign(
                        {
                            username: user.username,
                        },
                        PRIVATE_KEY,
                        { expiresIn: "30m", algorithm: "RS256" }
                    );
                    return res.status(200).json({ status: 200, token });
                }
            }
        );
    } else {
        res.status(403).json({ status: 403, message: "Forbidden" });
    }
});



module.exports = router
