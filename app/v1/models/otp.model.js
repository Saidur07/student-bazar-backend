const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    CustomerID: {
        type: String,
        required: true,
        unique: true,
    },
    OTPHash: {
        type: String,
        required: true,
    },
    Expiry: {
        type: Date,
        required: true,
        // expire in 5 minutes
        // default: Date.now() + 5 * 60 * 1000,
    },
    Provider:{
        type: String,
        required: true,
    },
    ProviderCredential:{
        type: String,
        required: true,
    }
});

const OTPModel = mongoose.model('otps', OTPSchema);
module.exports = OTPModel;
