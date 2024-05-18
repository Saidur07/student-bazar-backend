const nodemailer = require('nodemailer');
const bcrypt = require("bcryptjs");
const OTPModel = require('../models/otp.model')

const SendEmail = async({email, subject, text}) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
            tls:{
                rejectUnauthorized:false,
            }
        });

        const mailOptions = {
            from: `"Student Bazar" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            text: text,
        };

        return await transporter.sendMail(mailOptions);
    }catch (e) {
        console.log(e.message)
    }
}

const SendOTP = async({email, OTP}) => {
    try {
        return await SendEmail({
            email:email,
            subject:'OTP for verification',
            text:`We are glad you registerd at Student Bazar. We are always there for you. \nYour OTP is ${OTP}. \n\nDo not share this OTP with anyone.`, 
        })
    }catch (e) {
        console.log(e.message)
    }
}

module.exports = {SendEmail,SendOTP};
