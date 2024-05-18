const mongoose = require('mongoose');

const ResetPasswordSchema = new mongoose.Schema({
    CustomerID:{
        type: String,
        required: true,
        unique: true,
    },
    AuthProvider:{
        type: String,
        required: true,
    },
    ProviderCredential:{
        type: String,
        required: true,
    },  
    ResetPasswordToken:{
        type: String
    },
    PasswordresetExpires:{
        type: Date,
        required: true,
    },
    OTPHash:{
        type: String,
        required: true,
    },
})

const ResetModel = mongoose.model('ResetPassword', ResetPasswordSchema);
module.exports = ResetModel;